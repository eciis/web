"use strict";

(function() {
    var app = angular.module("app");

    app.directive("loadCircle", function() {
        return {
            restrict: 'E',
            template: '<div flex>'
                    + '<div layout="column" layout-align="center center" layout-fill>'
                    + '<md-progress-circular md-mode="indeterminate"></md-progress-circular>'
                    + '</div>'
                    + '</div>'
        };
    });
})();