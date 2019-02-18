/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('FloorPlan', [
    'HABmin.itemModel'
])
    .directive('floorPlan', function ($window, $timeout, ItemModel) {
        return {
            restrict: 'E',
            template: '<div class="floorplan fade" ng-style="style" ng-class="class">' +
            '<img ng-src="{{image}}">' +
            '<div ng-repeat="hotspot in hotspotArray">' +
            '<div class="hotspot" ng-style="hotspot.style">' +
            '<span class="badge" ng-class="hotspot.class" ng-click="hotspotClicked(hotspot)">' +
            '<habmin-icon category="{{hotspot.category}}"></habmin-icon>' +
            '<span ng-if="hotspot.category">&nbsp;</span>' +
            '<span>{{hotspot.label}}</span>' +
            '</span>' +
            '</div>' +
            '</div>' +
            '</div>',
            scope: {
                image: "@",
                hotspotList: "=",
                hotspotClick: "="
            },
            link: function ($scope, element, attr) {
                $scope.style = {};
                $scope.class = "";
                $scope.hotspotArray = [];

                $scope.$watchCollection('hotspotList', function (hotspots) {
                    $scope.hotspotArray = [];
                    angular.forEach(hotspots, function (hotspot) {
                        var hs = {
                            style: {
                                left: hotspot.posX + "%",
                                top: hotspot.posY + "%"
                            },
                            class: "",
                            callback: hotspot
                        };
                        if (hotspot.itemId == null) {
                            hs.label = "!!??!!";
                            $scope.hotspotArray.push(hs);
                            return;
                        }

                        // Get the initial value of the item
                        var item = ItemModel.getItem(hotspot.itemId);
                        if (item == null) {
                            hs.label = "!!??!!";
                            $scope.hotspotArray.push(hs);
                        }
                        else {
                            hs.category = item.category;

                            if (item.state == "Uninitialized" || item.state == "NULL") {
                                hs.label = "---";
                            } else {
                                hs.label = item.state;
                            }
                            $scope.hotspotArray.push(hs);
                        }

                        // And then watch for changes
                        $scope.$on('smarthome/update/' + hotspot.itemId, function (event, value) {
                            hs.label = value;

                            hs.class = "updated";
                            $timeout(function () {
                                hs.class = "";
                                $scope.$apply();
                            }, 250);

                            $scope.$apply();
                        });
                    });
                });

                $scope.hotspotClicked = function (hotspot) {
                    if (!$scope.hotspotClick) {
                        return;
                    }

                    $scope.hotspotClick(hotspot.callback);
                };

                var imgElement = element.children().children();
                var divElement = element.parent();

                // Resize the image.
                // Actually, we let CSS do the resizing, we just need
                // to work out how to constrain it
                $scope.resizeImage = function () {
                    var imgH = imgElement[0].naturalHeight;
                    var imgW = imgElement[0].naturalWidth;

                    var h = divElement.height();
                    var w = divElement.width();

                    var rH = h / imgH;
                    var rW = w / imgW;

                    var margin;
                    if (rW > rH) {
                        var nW = h * (imgW / imgH);
                        margin = Math.abs(w - nW) / 2;
                        $scope.style = {height: "100%", width: nW, marginLeft: margin, marginRight: margin};
                    }
                    else {
                        var nH = w * (imgH / imgW);
                        margin = Math.abs(h - nH) / 2;
                        $scope.style = {width: "100%", height: nH, marginTop: margin, marginBottom: margin};
                    }

                    console.log("resize floorplan :", h, w, rH, rW, $scope.style);
                };

                $scope.getHotspotStyle = function (hotspot) {
                    return {left: hotspot.posX + "%", top: hotspot.posY + "%"};
                };

                imgElement.bind('load', function () {
                    $scope.resizeImage();
                    $scope.class = "in";
                    $scope.$apply();
                });
                imgElement.bind('error', function () {
                    $scope.class = "";
                    $scope.$apply();
                    console.log("Error loading img");
                });
                var w = angular.element($window);
                w.bind('resize', function () {
                    $scope.resizeImage();
                    $scope.$apply();
                });
                $scope.$watch('image', function (newVal) {
                    $scope.class = "";
                });
            }
        };
    })

;

