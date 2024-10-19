angular.module('web.colorpicker', [])

angular.module('web.colorpicker').directive('webColorpicker', function() {
  return {
    template: '<div>' +
      '<div ng-repeat="row in rows" ng-style="{ \'margin-left\': \'\' + row.offset*dabWidth +\'px\', height: \'\' + dabHeight - dabVertical + \'px\', \'min-width\': \'\' + 13*dabWidth + \'px\' }">' +
      '<div class="color-picker-swatch" ng-repeat="color in row.colors" ng-click="selectColor(color)" style="display: inline-block; position: relative; cursor: pointer;" ng-style="{ \'box-shadow\': color == dabModel ? \'0 0 0 2px hsl(0, 0%, 100%),0 0 0 4px hsl(0, 0%, 15%)\' : \'none\', \'z-index\': color == dabModel ? 3 : 2, \'background-color\': color, height: \'\' + dabHeight + \'px\', width: \'\' + dabWidth + \'px\', \'border-radius\': \'\' + dabRadius + \'%\', transform: \'rotate(\' + dabRotate + \'deg)\', \'margin-top\': \'\' + dabTop + \'px\' }">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="transparent-swatch-arrow"><i class="glyphicon glyphicon-arrow-up"></i> <span translate>Transparent</span></div>',
    restrict: 'EA',
    scope: {
      dabModel: '=',
      dabHeight: '@',
      dabWidth: '@',
      dabRadius: '@',
      dabVertical: '@',
      dabRotate: '@',
      showGrayscale: '@'
    },
    link: function(scope, ele, attrs) {

      scope.selectColor = function(color) {
      	scope.dabModel = color
      }

      scope.rows = [
        { offset: 3,    colors: ['#003366', '#336699', '#3366CC', '#003399', '#000099', '#0000CC', '#000066'] },
        { offset: 2.5,  colors: ['#006666', '#006699', '#0099CC', '#0066CC', '#0033CC', '#0000FF', '#3333FF', '#333399'] },
        { offset: 2,    colors: ['#669999', '#009999', '#33CCCC', '#00CCFF', '#0099FF', '#0066FF', '#3366FF', '#3333CC', '#666699'] },
        { offset: 1.5,  colors: ['#339966', '#00CC99', '#00FFCC', '#00FFFF', '#33CCFF', '#3399FF', '#6699FF', '#6666FF', '#6600FF', '#6600CC'] },
        { offset: 1,    colors: ['#339933', '#00CC66', '#00FF99', '#66FFCC', '#66FFFF', '#66CCFF', '#99CCFF', '#9999FF', '#9966FF', '#9933FF', '#9900FF'] },
        { offset: 0.5,  colors: ['#006600', '#00CC00', '#00FF00', '#66FF99', '#99FFCC', '#CCFFFF', '#CCCCFF', '#CC99FF', '#CC66FF', '#CC33FF', '#CC00FF', '#9900CC'] },
        { offset: 0,    colors: ['#003300', '#009933', '#33CC33', '#66FF66', '#99FF99', '#CCFFCC', '#FFFFFF', '#FFCCFF', '#FF99FF', '#FF66FF', '#FF00FF', '#CC00CC', '#660066'] },
        { offset: 0.5,  colors: ['#336600', '#009900', '#66FF33', '#99FF66', '#CCFF99', '#FFFFCC', '#FFCCCC', '#FF99CC', '#FF66CC', '#FF33CC', '#CC0099', '#993399'] },
        { offset: 1,    colors: ['#333300', '#669900', '#99FF33', '#CCFF66', '#FFFF99', '#FFCC99', '#FF9999', '#FF6699', '#FF3399', '#CC3399', '#990099'] },
        { offset: 1.5,  colors: ['#666633', '#99CC00', '#CCFF33', '#FFFF66', '#FFCC66', '#FF9966', '#FF6666', '#FF0066', '#CC6699', '#993366'] },
        { offset: 2,    colors: ['#999966', '#CCCC00', '#FFFF00', '#FFCC00', '#FF9933', '#FF6600', '#FF5050', '#CC0066', '#660033'] },
        { offset: 2.5,  colors: ['#996633', '#CC9900', '#FF9900', '#CC6600', '#FF3300', '#FF0000', '#CC0000', '#990033'] },
        { offset: 3,    colors: ['#663300', '#996600', '#CC3300', '#993300', '#990000', '#800000', '#993333'] }
      ];

      if (scope.showGrayscale) {
        scope.rows.push({ colors: [] })
        scope.rows.push({ offset: 1.5,  colors: ['#E6E6E6', '#CCCCCC', '#B3B3B3', '#999999', '#808080', '#666666', '#4C4C4C', '#333333', '#191919', '#000000'] })
        scope.rows.push({ colors: [] })
        scope.rows.push({ offset: 0,  colors: ['transparent'] })
      }

      var area, i, len, ref;

      ref = scope.rows
      for (i = 0, len = ref.length; i < len; i++) {
        color = ref[i]
        for (j = 0, leng = color.length; j < leng; j++) {
          if (color === scope.dabModel) {
            scope.selectColor(color)
          }
        }
      }
    }
  }
})
