"use strict";

(function() {
    var app = angular.module("app");

    app.directive("loadCircle", function() {
        return {
            restrict: 'E',
            templateUrl: "app/utils/load_circle.html",
            scope: {}
        };
    });
})();