/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.updateService', [])
    .service("UpdateService", function ($rootScope, $http) {
        this.checkForUpdates = function () {
            $http.jsonp("https://api.github.com/repos/cdjackson/HABmin2/releases?callback=JSON_CALLBACK").
                success(function (result) {
                    if (result == null) {
                        return;
                    }
                    if (result.data == null) {
                        return;
                    }

                    // Find the latest version(s)
                    var currentReleaseTime = 0;
                    var newestReleaseTime = 0;
                    var newestReleaseVersion = "";
                    var newestPrereleaseTime = 0;
                    var newestPrereleaseVersion = "";
                    for (var cnt = 0; cnt < result.data.length; cnt++) {
                        console.log("Version " + result.data[cnt].tag_name + " draft=" + result.data[cnt].draft +
                        " pre=" + result.data[cnt].prerelease + " " + result.data[cnt].published_at);
                        // Ignore drafts
                        if (result.data[cnt].draft === true) {
                            continue;
                        }

                        // Find the latest prerelease and release versions
                        if (result.data[cnt].prerelease === false) {
                            if (Date.parse(result.data[cnt].published_at) > newestReleaseTime) {
                                newestReleaseTime = Date.parse(result.data[cnt].published_at);
                                newestReleaseVersion = result.data[cnt].tag_name;
                            }
                        }
                        else {
                            if (Date.parse(result.data[cnt].published_at) > newestPrereleaseTime) {
                                newestPrereleaseTime = Date.parse(result.data[cnt].published_at);
                                newestPrereleaseVersion = result.data[cnt].tag_name;
                            }
                        }
                    }

                    // Get the time of the last pre-release notification
                    // We don't want to notify our users too often!
                    var lastPrereleaseCheck = localStorage.getItem("lastPrereleaseNotification");
                    if (lastPrereleaseCheck == null) {
                        lastPrereleaseCheck = 0;
                    }

                    // Check if we have a new release
                    if (newestReleaseTime > currentReleaseTime) {
                        console.log("New Release available", newestReleaseVersion,
                            moment(newestPrereleaseTime).format("D MMM"));
                    }
                    else if (lastPrereleaseCheck < (new Date()).getTime() - (5 * 86400000)) {
                        if (newestPrereleaseTime > currentReleaseTime) {
                            console.log("New Pre-Release available", newestPrereleaseVersion,
                                moment(newestPrereleaseTime).format("D MMM"));

//                            localStorage.setItem("lastPrereleaseNotification", (new Date()).getTime());
                        }
                    }
                })
                .error(function (data, status) {

                });
        };
    })
;

