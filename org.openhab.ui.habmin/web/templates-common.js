angular.module('templates-common', ['../web/common/ngCron.tpl.html']);

angular.module("../web/common/ngCron.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../web/common/ngCron.tpl.html",
    "<form class=form-horizontal role=form><div class=form-group><label for=inputStart class=control-label i18n1=habmin.chartSaveName>Start</label><div><input ng-model=model.name class=form-control id=inputStart placeholder=Name></div></div><div class=form-group><label for=inputRepeat class=control-label i18n1=habmin.chartSavePeriod>Repeat</label><div><select ng-model=model.period class=form-control id=inputRepeat><option value=0 i18n1=habmin.never>Never</option><option value=0 i18n1=habmin.period1Hour>every Minute</option><option value=0 i18n1=habmin.period1Hour>every Hour</option><option value=0 i18n1=habmin.period1Hour>every Hour</option><option value=0 i18n1=habmin.period1Hour>every Hour</option><option value=0 i18n1=habmin.period1Hour>every Hour</option><option value=0 i18n1=habmin.period1Hour>every Hour</option><option value=0 i18n1=habmin.period1Hour>every Hour</option></select></div></div></form>");
}]);
