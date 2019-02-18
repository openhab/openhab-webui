/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardFloorWidget', [
    'HABmin.itemModel',
    'FloorPlan'
])
    .directive('dashboardFloorplan', function (FloorplanModel) {
        return {
            restrict: 'E',
            templateUrl: 'dashboard/dashboardFloorplanWidget.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope, element) {
                FloorplanModel.getFloorplan($scope.options.floorplanId).then(
                    function (floorplan) {
                        $scope.hotspotList = floorplan.hotspots;
                        $scope.floorplanImage = "/rest/habmin/floorplan/" + floorplan.id + "/image";
                    }
                );

                $scope.clickHotspot = function (hotspot) {

                };
            }
        };
    })

    .directive('dashboardFloorplanProperties', function (FloorplanModel) {
        return {
            restrict: 'E', // Use as element
            scope: {
                options: "="
            },
            templateUrl: 'dashboard/dashboardFloorplanProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.floorplanList = [];
                FloorplanModel.getList().then(
                    function (list) {
                        $scope.floorplanList = list;
                    }
                );
            }
        };
    })

;
