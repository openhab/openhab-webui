/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.userModel', [
    'http-auth-interceptor',
    'base64',
    'ngLocalize'
])
    .factory('UserService', function ($http, $rootScope, authService, locale) {
        // The 'authenticated' flag is set to true if we have a user logged in
        var authenticated = false;

        // The 'loginRequired' flag is set to true if we've requested the user logs in.
        // This is specifically needed during startup where the login directive may not
        // have loaded, and we need to know that the app has requested a login.
        var loginRequired = false;

        // Install handlers to catch authorisation failures
        $rootScope.$on('event:auth-loginConfirmed', function () {
            console.log("Login complete");
            authenticated = true;
            loginRequired = false;
        });

        // On startup, check the local storage to see if we've got saved info here
        var storedPass = localStorage.getItem('Auth-pass');
        var storedTime = localStorage.getItem('Auth-time');

        if (storedTime > new Date().getTime()) {
            console.log("Using saved authentication data!");
            $http.defaults.headers.common['Authorization'] = 'Basic ' + storedPass;

            authenticated = true;
        }
        else if (storedTime != null) {
            console.log("Removing saved authentication data!");
            // Timeout - remove the password etc.
            localStorage.removeItem('Auth-pass');
            localStorage.removeItem('Auth-time');

            // Reset the authentication header
            $http.defaults.headers.common['Authorization'] = '';
        }

        var userConfig = {
            useCache: false,
            theme: "slate",
            language: "en-GB",
            persistence: ""
        };

        // For Cordova, get the server from local storage
        var server = "";
        if (document.HABminCordova === true) {
            server = localStorage.getItem('Server');
            if (server == null) {
                server = "";
            }
        }

        // TODO: Maybe this should just save/restore the userConfig object???
        // If we've previously saved the theme, restore the user selection
        if (localStorage.getItem('Theme') != null) {
            userConfig.theme = localStorage.getItem('Theme');
        }

        // If we've previously saved the language, restore the user selection
        if (localStorage.getItem('Language') != null) {
            userConfig.language = localStorage.getItem('Language');
            locale.setLocale(userConfig.language);
            moment.locale(userConfig.language);
        }

        // If we've previously saved the persistence service, restore the user selection
        if (localStorage.getItem('Persistence') != null) {
            userConfig.persistence = localStorage.getItem('Persistence');
        }

        function changeUser(user) {
        }

        if (authenticated === true) {
            // Send the login confirmation to signal the system that we're online
            console.log("User authenticated at startup - confirming login");
            authService.loginConfirmed();
        }
        else {
            // If we didn't log in, then pop up the login box to make it clear
            // what's required!
            loginRequired = true;
            $rootScope.$broadcast('event:auth-loginRequired');
        }

        return {
            isLoggedIn: function () {
                return true;//authenticated;
            },

            isLoginRequired: function () {
                return loginRequired;
            },

            setServer: function (newServer) {
                server = newServer;
                localStorage.setItem('Server', server);
            },

            getServer: function () {
                if (document.HABminCordova === true) {
                    return server;
                }
                return "";
            },

            setTheme: function (theme) {
                // Save the theme to local storage
                localStorage.setItem('Theme', theme);

                userConfig.theme = theme;
                $rootScope.$broadcast('habminTheme', theme);
            },

            getTheme: function () {
                return userConfig.theme;
            },

            setLanguage: function (language) {
                // Save the language to local storage
                localStorage.setItem('Language', language);

                userConfig.language = language;
            },

            getLanguage: function () {
                return userConfig.language;
            },

            setPersistence: function (persistence) {
                // Save the persistence service to local storage
                localStorage.setItem('Persistence', persistence);

                userConfig.persistence = persistence;
            },

            getPersistence: function () {
                return userConfig.persistence;
            },

            login: function () {
                loginRequired = true;
                $rootScope.$broadcast('event:auth-loginRequired');
            },

            logout: function (success, error) {
                $http.defaults.headers.common['Authorization'] = '';
                authenticated = false;
                userConfig = {};

                localStorage.removeItem('Auth-pass');
                localStorage.removeItem('Auth-time');

//                $http.post('/logout').success(function () {
//                    changeUser({
//                        username: '',
//                        role: userRoles.public
//                    });
//                    success();
//                }).error(error);
            },

            userCfg: function () {
                return userConfig;
            }

//            accessLevels: accessLevels,
//            userRoles: userRoles,
//            user: currentUser
        };
    })

    .directive('loginHandler', function (UserService) {
        return {
            restrict: 'C',
            link: function (scope, elem, attrs) {
                var login = elem.find('#login-holder');
                var main = elem.find('#content');

                login.hide();

                scope.$on('event:auth-loginRequired', function () {
                    console.log("LOGIN: Authentication required.");
                    $('#login-holder').slideDown('slow', function () {
                        $('#content').hide();
                    });
                });
                scope.$on('event:auth-loginConfirmed', function () {
                    console.log("LOGIN: Authentication confirmed.");
                    $('#content').show();
                    $('#login-holder').slideUp();
                });

                // During startup, we need to handle asynchronous operations.
                // This directive may not have loaded when the app is checking
                // to see if we've logged in. So, we store a 'loginRequired' flag
                // and check it here to see what we need to do!
                if (UserService.isLoginRequired()) {
                    UserService.login();
                }
            }
        };
    })

    .controller('LoginController', function ($scope, $http, $base64, authService, UserService) {
        $scope.user = localStorage.getItem('Auth-user');
        if ($scope.user == null || $scope.user == 'null') {
            $scope.user = "";
        }
        $scope.period = localStorage.getItem('Auth-period');

        $scope.showServer = document.HABminCordova;
        $scope.server = UserService.getServer();

        $scope.HABminVersion = document.HABminVersionString;
        $scope.HABminDate = moment(document.HABminVersionDate).format("ll");

        if ($scope.period == null) {
            $scope.period = 3600;
        }

        $scope.submit = function () {
            console.log("Login info submitted.");

            // The user can't (currently) set the timeout period, so make it 7 days
            $scope.period = 7 * 86400;

            UserService.setServer($scope.server);

            if ($scope.user == null || $scope.user == 'null') {
                $scope.user = "";
            }
            if ($scope.password == null || $scope.password == 'null') {
                $scope.password = "";
            }

            var pass = "";
            if ($scope.user === "" || $scope.password === "") {
                // No authentication used
                $http.defaults.headers.common['Authorization'] = null;
            }
            else {
                // Add the authentication headers
                pass = $base64.encode($scope.user + ':' + $scope.password);
                $http.defaults.headers.common['Authorization'] = 'Basic ' + pass;
            }

            console.log("Login credentials: ", $scope.password, $scope.user, pass);
            localStorage.setItem('Auth-user', $scope.user);
            localStorage.setItem('Auth-pass', pass);
            localStorage.setItem('Auth-time', $scope.period * 1000 + new Date().getTime());
            localStorage.setItem('Auth-period', $scope.period);

            authService.loginConfirmed(null, function (config) {
                config.headers['Authorization'] = 'Basic ' + pass;
                return config;
            });
        };
    })
;
