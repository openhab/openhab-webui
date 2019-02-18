(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetColorpicker', widgetColorpicker)
        .controller('WidgetSettingsCtrl-colorpicker', WidgetSettingsCtrlColorpicker)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'colorpicker',
                displayName: 'Color Picker',
                icon: 'tint',
                description: 'Displays an color picker'
            });
        });

    widgetColorpicker.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetColorpicker($rootScope, $modal, OHService) {
        // Usage: <widget-colorpicker ng-model="widget" />
        //
        // Creates: A colorpicker widget
        //
        var directive = {
            bindToController: true,
            controller: ColorpickerController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/colorpicker/colorpicker.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {

            // from https://bl.ocks.org/mbostock/debaad4fcce9bcee14cf

            var el = element;
            var channel, channels, canvas;
            var width, height;
            var white = d3.rgb("white"), black = d3.rgb("black");

            scope.redraw = function () {

                width = element[0].parentNode.parentNode.parentNode.style.width.replace('px', '') - 80;
                height = element[0].parentNode.parentNode.parentNode.style.height.replace('px', '');
                if (scope.vm.widget.name) height -= 20;

                scope.value = { h: -1, s: -1, l: -1 };

                angular.forEach(angular.element(element).find("canvas"), function (el) {
                    el.width = width;
                    el.style.width = width + 'px';
                    el.style.height = (height / 3 - 30) + 'px';
                    // clear existing color swatches
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                });
                angular.forEach(angular.element(element).find("svg"), function (el) {
                    el.style.width = (width + 60) + 'px';
                    // clear existing axes
                    while (el.firstChild.firstChild) {
                        el.firstChild.removeChild(el.firstChild.firstChild);
                    }
                });



                channels = scope.channels = {
                    h: {scale: d3.scale.linear().domain([0, 360]).range([0, width]), x: width / 2},
                    s: {scale: d3.scale.linear().domain([0, 1]).range([0, width]), x: width / 2},
                    l: {scale: d3.scale.linear().domain([0, 1]).range([0, width]), x: width / 2}
                };

                channel = scope.channel = d3.selectAll(element).selectAll(".channel")
                    .data(d3.entries(channels));

                channel.select(".axis")
                    .each(function(d) { d3.select(this).call(d3.svg.axis().scale(d.value.scale).orient("bottom")); })
                    .append("text")
                    .attr("x", width)
                    .attr("y", 9)
                    .attr("dy", ".72em")
                    .style("text-anchor", "middle")
                    .style("text-transform", "uppercase")
                    .text(function(d) { return d.key; });

                canvas = channel.select("canvas")
                    .call(d3.behavior.drag().on("drag", dragging).on("dragend", dragged))
                    .each(render);
            }

            function dragging(d) {
                d.value.x = Math.max(0, Math.min(this.width - 1, d3.mouse(this)[0]));
                canvas.each(render);
            }

            function dragged(d) {
                d.value.x = Math.max(0, Math.min(this.width - 1, d3.mouse(this)[0]));
                canvas.each(render);
                var scaledvalue = (d.key !== 'h') ? d.value.scale.invert(d.value.x) * 100 : d.value.scale.invert(d.value.x);
                scope.value[d.key] = scaledvalue;
                scope.vm.valueChanged(scope.value);
            }

            function render(d) {
                var width = this.width,
                    context = this.getContext("2d"),
                    image = context.createImageData(width, 15),
                    i = -1;

                var current = d3.hsl(
                    channels.h.scale.invert(channels.h.x),
                    channels.s.scale.invert(channels.s.x),
                    channels.l.scale.invert(channels.l.x)
                );

                for (var x = 0, v, c; x < width; ++x) {
                    if (Math.abs(x - d.value.x) <= 2) {
                        c = white;
                    } else if (Math.abs(x - d.value.x) <= 5) {
                        c = black;
                    } else {
                        current[d.key] = d.value.scale.invert(x);
                        c = d3.rgb(current);
                    }
                    image.data[++i] = c.r;
                    image.data[++i] = c.g;
                    image.data[++i] = c.b;
                    image.data[++i] = 255;
                }

                context.putImageData(image, 0, 0);
            }

            function setNewValue(val) {
            }

            scope.renderNewValue = function(val) {
                scope.value.h = Math.round(val[0]);
                scope.value.s = Math.round(val[1]);
                scope.value.l = Math.round(val[2]);

                this.channels.h.x = Math.round(scope.value.h / 360 * width);
                this.channels.s.x = Math.round(scope.value.s / 100 * width);
                this.channels.l.x = Math.round(scope.value.l / 100 * width);

                channel.select("canvas").each(render);
            };

            scope.redraw();
        }
    }
    ColorpickerController.$inject = ['$rootScope', '$scope', '$timeout', 'OHService'];
    function ColorpickerController ($rootScope, $scope, $timeout, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        // color conversions borrowed from https://github.com/Qix-/color-convert/blob/master/conversions.js
        function hsl2hsv(hsl) {
            var h = hsl[0];
            var s = hsl[1] / 100;
            var l = hsl[2] / 100;
            var smin = s;
            var lmin = Math.max(l, 0.01);
            var sv;
            var v;

            l *= 2;
            s *= (l <= 1) ? l : 2 - l;
            smin *= lmin <= 1 ? lmin : 2 - lmin;
            v = (l + s) / 2;
            sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

            return [h, sv * 100, v * 100];
        };
        
        function hsv2hsl(hsv) {
            var h = hsv[0];
            var s = hsv[1] / 100;
            var v = hsv[2] / 100;
            var vmin = Math.max(v, 0.01);
            var lmin;
            var sl;
            var l;

            l = (2 - s) * v;
            lmin = (2 - s) * vmin;
            sl = s * vmin;
            sl /= (lmin <= 1) ? lmin : 2 - lmin;
            sl = sl || 0;
            l /= 2;

            return [h, sl * 100, l * 100];
        }

        function updateValue() {
            var value = OHService.getItem(vm.widget.item).state;
            var splitted = value.split(',');
            if (value === 'NULL')
                vm.value = splitted = ['0','0','0'];
            else if (splitted.length === 3)
                vm.value = splitted;

            if (!vm.widget.style || vm.widget.style === 'default') {
                $scope.renderNewValue(hsv2hsl(splitted));
            } else if (vm.widget.style === 'aCKolor') {
                var hsl = hsv2hsl(splitted);
                vm.aCKolorModel = vm.value = 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';
                console.log(vm.aCKolorModel);
            }

            vm.ready = true;
        }

        function onResize() {
            $scope.redraw();
            updateValue();
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.valueChanged = function(val) {
            if (vm.lock) return;
            if (val.h < 0) return;

            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                return;
            }

            var hsv = hsl2hsv([val.h, val.s, val.l]);
            vm.value = [Math.round(hsv[0]), Math.round(hsv[1]), Math.round(hsv[2])].join(',');

            OHService.sendCmd(vm.widget.item, vm.value);
        };

        vm.onACkolorModelChanged = function (val) {
            var hsl = val.replace('hsl(','').replace(')','').replace('%','').replace('%','').split(',');
            var hsv = hsl2hsv([parseInt(hsl[0]), parseInt(hsl[1]), parseInt(hsl[2])]);
            vm.value = [Math.round(hsv[0]), Math.round(hsv[1]), Math.round(hsv[2])].join(',');

            OHService.sendCmd(vm.widget.item, vm.value);
        }

        var resizeHandler = $scope.$on('gridster-resized', onResize);
        $scope.$on('$destroy', onResize);
    }


    // settings dialog
    WidgetSettingsCtrlColorpicker.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlColorpicker($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            url: widget.url,
            item: widget.item,
            style: widget.style,
            blur_background: widget.blur_background
        };

        $scope.isColorItem = function(item) {
            return item.type.startsWith('Color');
        }

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };

    }


})();