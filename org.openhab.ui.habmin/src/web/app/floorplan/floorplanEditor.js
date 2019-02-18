/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('FloorplanEditor', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.floorplanModel',
    'Config.parameter',
    'angular-growl',
    'ResizePanel',
    'FloorPlan',
    'floorplanHotspotProperties',
    'FloorplanProperties'
])

    .config(function config($stateProvider) {
        $stateProvider.state('floorplan/editor', {
            url: '/floorplan/edit',
            views: {
                "main": {
                    controller: 'FloorplanEditor',
                    templateUrl: 'floorplan/floorplanEditor.tpl.html'
                }
            },
            data: {pageTitle: 'Floorplan'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('floorplan');
                }
            }
        });
    })

    .controller('FloorplanEditor',
    function FloorplanEditorCtrl($scope, $sce, locale, growl, FloorplanModel, floorplanProperties, floorplanHotspotProperties) {
        $scope.floorplanList = [];
        $scope.selectedFloorplan = null;
        $scope.floorplanImageUpdated = false;
        $scope.isDirty = false;

        FloorplanModel.getList().then(
            function (list) {
                $scope.floorplanList = list;
            }
        );

        $scope.selectFloorplan = function (floorplan) {
            FloorplanModel.getFloorplan(floorplan.id).then(
                function (fp) {
                    $scope.selectedFloorplan = fp;
                    $scope.floorplanImage = "/rest/habmin/floorplan/" + floorplan.id + "/image";
                }
            );
        };

        /**
         * Event when image is clicked to add a hotspot.
         * @param event
         */
        $scope.imgClicked = function (event) {
            // Make sure this is on the image
            if (event.toElement.localName != "img") {
                return;
            }

            // Getting dirty...
            $scope.isDirty = true;

            // Get the position of the click - rounding to 2 decimal places
            var posX = Math.round(event.offsetX / event.toElement.width * 10000) / 100;
            var posY = Math.round(event.offsetY / event.toElement.height * 10000) / 100;

            // Add the new hotspot to the list
            var newHotspot = {posX: posX, posY: posY};
            $scope.selectedFloorplan.hotspots.push(newHotspot);

            // And open the properties dialog
            $scope.editHotspot(newHotspot);
        };

        $scope.editHotspot = function (hotspot) {
            floorplanHotspotProperties.editOptions(hotspot).then(
                function (result) {
                    if (result == null) {
                        return;
                    }

                    if (result.cmd == 'save' || result.cmd == 'delete') {
                        // First we want to remove the current hotspot from the list
                        var pnt = -1;
                        for (var i = 0; i < $scope.selectedFloorplan.hotspots.length; i++) {
                            if ($scope.selectedFloorplan.hotspots[i] == hotspot) {
                                pnt = i;
                                break;
                            }
                        }

                        if (pnt != -1) {
                            $scope.selectedFloorplan.hotspots.splice(pnt, 1);
                        }
                    }

                    if (result.cmd == 'save') {
                        // Then if we're saving it, we add the new one back it
                        $scope.selectedFloorplan.hotspots.push(result.hotspot);
                    }

                    // Getting dirty...
                    $scope.isDirty = true;
                }
            )
        };

        $scope.editFloorplan = function () {
            floorplanProperties.editOptions($scope.selectedFloorplan).then(
                function (floorplan) {
                    $scope.selectedFloorplan = floorplan;

                    // Getting dirty...
                    $scope.isDirty = true;
                }
            );
        };

        $scope.saveFloorplan = function () {
            function save() {
                FloorplanModel.putFloorplan($scope.selectedFloorplan).then(
                    function () {
                        growl.success(locale.getString('floorplan.SaveOk',
                            {name: $scope.selectedFloorplan.name}));

                        $scope.selectedFloorplan.imgBase64 = null;

                        // Clear the dirty flag
                        $scope.isDirty = false;
                    },
                    function () {
                        growl.warning(locale.getString('floorplan.SaveError',
                            {name: $scope.selectedFloorplan.name}));
                    }
                );
            }

            // If we have a new image file loaded, then load the file before saving
            // Otherwise, just save!
            if ($scope.newFile != null) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope.selectedFloorplan.imgBase64 = window.btoa(e.target.result);
                    save();
                };
                reader.readAsBinaryString($scope.newFile);
            }
            else {
                save();
            }
        };

        $scope.floorplanDelete = function () {
            FloorplanModel.deleteFloorplan($scope.selectedFloorplan.id);
        };

        $scope.newFloorplan = function () {
            $scope.selectedFloorplan = {hotspots: []};
            $scope.editFloorplan();
        };

        $scope.selectImage = function (newFile) {
            // Remember the file so we can save it later.
            $scope.newFile = newFile;

            // Load the image and display it
            var reader = new FileReader();

            reader.onload = function (e) {
                $scope.floorplanImage = e.target.result;
                $scope.$apply();
            };

            reader.readAsDataURL(newFile);

            // Getting dirty...
            $scope.isDirty = true;
        };
    })

;





