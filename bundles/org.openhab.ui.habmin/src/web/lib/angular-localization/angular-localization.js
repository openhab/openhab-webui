/**
 * angular-localization :: v1.2.2 :: 2015-06-06
 * web: https://github.com/doshprompt/angular-localization
 *
 * Copyright (c) 2015 | Rahul Doshi
 * License: MIT
 */
;(function (angular, window, document, undefined) {
    'use strict';
    angular.module('ngLocalize.Config', [])
        .value('localeConf', {
            basePath: 'languages',
            defaultLocale: 'en-US',
            sharedDictionary: 'common',
            fileExtension: '.lang.json',
            persistSelection: true,
            cookieName: 'COOKIE_LOCALE_LANG',
            observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
            delimiter: '::'
        });
    angular.module('ngLocalize.Events', [])
        .constant('localeEvents', {
            resourceUpdates: 'ngLocalizeResourcesUpdated',
            localeChanges: 'ngLocalizeLocaleChanged'
        });
    angular.module('ngLocalize', ['ngSanitize', 'ngLocalize.Config', 'ngLocalize.Events', 'ngLocalize.InstalledLanguages'])
        .service('locale', function ($injector, $http, $q, $log, $rootScope, $window, localeConf, localeEvents, localeSupported, localeFallbacks) {
            var TOKEN_REGEX = new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$'),
                currentLocale,
                locales = [],
                languageBundles,
                deferrences = {},
                bundles,
                cookieStore;

            if (localeConf.persistSelection && $injector.has('$cookieStore')) {
                cookieStore = $injector.get('$cookieStore');
            }

            function isToken(str) {
                return (str && str.length && TOKEN_REGEX.test(str));
            }

            function getPath(tok) {
                var path = tok ? tok.split('.') : '',
                    result = '';

                if (path.length > 1) {
                    result = path.slice(0, -1).join('.');
                }

                return result;
            }

            function getKey(tok) {
                var path = tok ? tok.split('.') : [],
                    result = '';

                if (path.length) {
                    result = path[path.length - 1];
                }

                return result;
            }

            /**
             * Return the bundle for the requested token and language
             * @param tok The requested token. The token is split between paths using the point
             * @param lang The requested language
             * @returns {*} The bundle object if the bundle has been loaded.
             *              If the bundle is not loaded, returns null
             */
            function getBundle(tok, lang) {
                var result = null,
                    path = tok ? tok.split('.') : [],
                    i;

                if (path.length > 1) {
                    result = languageBundles[lang];

                    // Iterate through the bundle tree to find the requested bundle
                    for (i = 0; i < path.length - 1; i++) {
                        if (result[path[i]]) {
                            result = result[path[i]];
                        } else {
                            result = null;
                            break;
                        }
                    }
                }

                return result;
            }

            /**
             * Loads a language bundle from the server.
             * @param token The token, including the path and string name (separated by a .)
             *              Mulitple folders can be separated by a '.' - the last token being the
             *              filename.
             * @param lang The requested localization
             */
            function loadBundle(token, lang) {
                var path = token ? token.split('.') : '',
                    root = languageBundles[lang],
                    url = localeConf.basePath + '/' + lang,
                    i;

                // If the path is defined...
                if (path.length > 1) {
                    // Concatenate the path together to form the URL
                    // Build a tree object where the bundle information will be loaded
                    for (i = 0; i < path.length - 1; i++) {
                        if (!root[path[i]]) {
                            root[path[i]] = {};
                        }
                        root = root[path[i]];
                        url += "/" + path[i];
                    }

                    if (!root._loading) {
                        // Remember that we're loading this bundle to stop subsequent calls to the server
                        root._loading = true;

                        url += localeConf.fileExtension;

                        // Request the data from the server
                        $http.get(url)
                            .success(function (data) {
                                var key,
                                    path = getPath(token);
                                // Merge the contents of the obtained data into the stored bundle.
                                for (key in data) {
                                    if (data.hasOwnProperty(key)) {
                                        root[key] = data[key];
                                    }
                                }

                                // Mark the bundle as having been "loaded".
                                delete root._loading;

                                // Notify anyone who cares to know about this event.
                                $rootScope.$broadcast(localeEvents.resourceUpdates);

                                // If we issued a Promise for this file, resolve it now.
                                var localpath = path + "." + lang;
                                if (deferrences[localpath]) {
                                    deferrences[localpath].resolve(localpath);
                                }
                            })
                            .error(function (data) {
                                $log.error("[localizationService] Failed to load: " + url);

                                // We can try it again later.
                                delete root._loading;
                            });
                    }
                }
            }

            /**
             * Checks if a bundle has been loaded, and if not, loaded it
             * @param path bundle path
             * @param locale requested locale
             * @returns promise. If the bundle is loaded, the promise is already resolved
             */
            function bundleReady(path, locale) {
                var bundle,
                    token;

                path = path || localeConf.langFile;
                token = path + "._LOOKUP_";

                // Get the bundle if it's loaded. Returns null if not loaded
                bundle = getBundle(token, locale);

                var localepath = path + "." + locale;

                // Create a promise for this bundle
                if (!deferrences[localepath]) {
                    deferrences[localepath] = $q.defer();
                }

                if (bundle && !bundle._loading) {
                    // The bundle has been loaded, so full-fill our promise
                    deferrences[localepath].resolve(localepath);
                } else if (!bundle) {
                    // The bundle is not loaded, so load it
                    loadBundle(token, locale);
                }

                // Return the promise for the bundle we requested
                return deferrences[localepath].promise;
            }

            function ready(path) {
                var paths,
                    deferred,
                    outstanding;

                if (angular.isString(path)) {
                    paths = path.split(',');
                } else if (angular.isArray(path)) {
                    paths = path;
                } else {
                    throw new Error("locale.ready requires either an Array or comma-separated list.");
                }

                outstanding = [];
                paths.forEach(function (path) {
                    // Load all bundles that may be required by the fallback hierarchy
                    locales.forEach(function(locale) {
                        outstanding.push(bundleReady(path, locale));
                    });
                });

                deferred = $q.all(outstanding);
                return deferred;
            }

            function applySubstitutions(text, subs) {
                var res = text,
                    firstOfKind = 0;

                if (subs) {
                    if (angular.isArray(subs)) {
                        angular.forEach(subs, function (sub, i) {
                            res = res.replace('%' + (i + 1), sub);
                            res = res.replace('{' + (i + 1) + '}', sub);
                        });
                    } else {
                        angular.forEach(subs, function (v, k) {
                            ++firstOfKind;

                            res = res.replace('{' + k + '}', v);
                            res = res.replace('%' + k, v);
                            res = res.replace('%' + (firstOfKind), v);
                            res = res.replace('{' + (firstOfKind) + '}', v);
                        });
                    }
                }
                res = res.replace(/\n/g, '<br>');

                return res;
            }

            function getLocalizedString(txt, subs) {
                var bundle,
                    key,
                    A,
                    isValidToken = false;

                for (var i = 0; i < locales.length; i++) {
                    var result = getStringForLocale(txt, subs, locales[i]);
                    if(result != null) {
                        return result;
                    }
                }

                $log.info("[localizationService] Key not found: " + txt);
                return "%%KEY_NOT_FOUND%%";
            }

            function getStringForLocale(txt, subs, locale) {
                var result = null,
                    bundle,
                    key,
                    A,
                    isValidToken = false;

                if (angular.isString(txt) && !subs && txt.indexOf(localeConf.delimiter) != -1) {
                    A = txt.split(localeConf.delimiter);
                    txt = A[0];
                    subs = angular.fromJson(A[1]);
                }

                // If the token isn't valid, then just return it
                isValidToken = isToken(txt);
                if (!isValidToken) {
                    return txt;
                }

                if (!angular.isObject(subs)) {
                    subs = [subs];
                }

                // Load the file
                bundle = getBundle(txt, locale);
                if (bundle && !bundle._loading) {
                    key = getKey(txt);

                    if (bundle[key]) {
                        return applySubstitutions(bundle[key], subs);
                    }
                } else {
                    if (!bundle) {
                        loadBundle(txt, locale);
                    }
                }

                return null;
            }

            function setLocale(value) {
                var lang;
                var fall;

                if(!angular.isString(value)) {
                    lang = localeConf.defaultLocale;
                }
                else {
                    value = value.trim();

                    // Get the fallback first - if it's not valid, then use the default
                    if(localeSupported[localeFallbacks[value.split('-')[0]]] != null) {
                        fall = localeFallbacks[value.split('-')[0]];
                    }
                    else {
                        fall = localeConf.defaultLocale;
                    }

                    // Check if the requested locale is supported - if not, use the fallback
                    if(localeSupported[value] != null) {
                        lang = value;
                    }
                    else {
                        lang = fall;
                        fall = localeConf.defaultLocale;
                    }
                }

                if (languageBundles == null) {
                    languageBundles = {};
                    angular.forEach(localeSupported, function(value, key) {
                        languageBundles[key] = {};
                    });
                }

                // If the language has changed, then we need to reset the state
                // so we reload files next time
                if (lang != currentLocale) {
                    // Note that we don't reset the deferrences array since the array
                    // path includes the language, we don't need to reload all locales
                    currentLocale = lang;

                    // Create the locales list.
                    locales = [];
                    if(lang != localeConf.defaultLocale) {
                        locales.push(lang);
                    }
                    if(fall != localeConf.defaultLocale) {
                        locales.push(fall);
                    }
                    locales.push(localeConf.defaultLocale);

                    $rootScope.$broadcast(localeEvents.localeChanges, currentLocale);
                    $rootScope.$broadcast(localeEvents.resourceUpdates);

                    if (cookieStore) {
                        cookieStore.put(localeConf.cookieName, lang);
                    }
                }
            }

            /**
             * Returns the localized bundle given the bundle path.
             * Note that this will not load the bundle if it's not already loaded.
             * Therefore you should wrap this inside a call to ready
             * @param path the name of the bundle to retrieve
             * @returns {*} the bundle
             */
            function getLocalizedBundle(path) {
                var key = path + ".-";
                for (var i = 0; i < locales.length; i++) {
                    var bundle = getBundle(key, locales[i]);
                    if (bundle && !bundle._loading) {
                        return bundle;
                    }
                }

                return null;
            }

            function getLocale() {
                return currentLocale;
            }

            setLocale(cookieStore ? cookieStore.get(localeConf.cookieName) : $window.navigator.userLanguage || $window.navigator.language);

            return {
                ready: ready,
                isToken: isToken,
                getPath: getPath,
                getKey: getKey,
                setLocale: setLocale,
                getLocale: getLocale,
                getString: getLocalizedString,
                getBundle: getLocalizedBundle
            };
        })
        .filter('i18n', function (locale) {
            var i18nFilter = function (input, args) {
                return locale.getString(input, args);
            };

            i18nFilter.$stateful = true;

            return i18nFilter;
        })
        .directive('i18n', function ($sce, locale, localeEvents, localeConf) {
            function setText(elm, tag) {
                if (tag !== elm.html()) {
                    elm.html($sce.getTrustedHtml(tag));
                }
            }

            function update(elm, string, optArgs) {
                if (locale.isToken(string)) {
                    locale.ready(locale.getPath(string)).then(function () {
                        setText(elm, locale.getString(string, optArgs));
                    });
                } else {
                    setText(elm, string);
                }
            }

            return function (scope, elm, attrs) {
                var hasObservers;

                attrs.$observe('i18n', function (newVal, oldVal) {
                    if (newVal && newVal != oldVal) {
                        update(elm, newVal, hasObservers);
                    }
                });

                angular.forEach(attrs.$attr, function (attr, normAttr) {
                    if (localeConf.observableAttrs.test(attr)) {
                        attrs.$observe(normAttr, function (newVal, oldVal) {
                            if ((newVal && newVal != oldVal) || !hasObservers || !hasObservers[normAttr]) {
                                hasObservers = hasObservers || {};
                                hasObservers[normAttr] = attrs[normAttr];
                                update(elm, attrs.i18n, hasObservers);
                            }
                        });
                    }
                });

                scope.$on(localeEvents.resourceUpdates, function () {
                    update(elm, attrs.i18n, hasObservers);
                });
                scope.$on(localeEvents.localeChanges, function () {
                    update(elm, attrs.i18n, hasObservers);
                });
            };
        })
        .directive('i18nAttr', function (locale, localeEvents) {
            return function (scope, elem, attrs) {
                var lastValues = {};

                function updateText(target, attributes) {
                    var values = scope.$eval(attributes),
                        langFiles = [],
                        exp;

                    for(var key in values) {
                        exp = values[key];
                        if (locale.isToken(exp) && langFiles.indexOf(locale.getPath(exp)) == -1) {
                            langFiles.push(locale.getPath(exp));
                        }
                    }

                    locale.ready(langFiles).then(function () {
                        var value = '';

                        for(var key in values) {
                            exp = values[key];
                            value = locale.getString(exp);
                            if (lastValues[key] !== value) {
                                attrs.$set(key, lastValues[key] = value);
                            }
                        }
                    });
                }

                attrs.$observe('i18nAttr', function (newVal, oldVal) {
                    if (newVal && newVal != oldVal) {
                        updateText(elem, newVal);
                    }
                });

                scope.$on(localeEvents.resourceUpdates, function () {
                    updateText(elem, attrs.i18nAttr);
                });
                scope.$on(localeEvents.localeChanges, function () {
                    updateText(elem, attrs.i18nAttr);
                });
            };
        });

    angular.module('ngLocalize.InstalledLanguages', [])
        .value('localeSupported', {
            'en-US': "English (United States)"
        })
        .value('localeFallbacks', {
            'en': 'en-US'
        });
    angular.module('ngLocalize.Version', [])
        .constant('localeVer', '1.2.2');
})(window.angular, window, document);