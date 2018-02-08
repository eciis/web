"use strict";

(function() {
    var app = angular.module("app");

    app.controller("LoadController", function($scope){
        console.log($scope.addLayoutFill);
        $scope.addLayoutFill ? 
            document.getElementById("element").classList.add("layout-fill") : "";
    });

    app.directive("loadCircle", function() {
        return {
            restrict: 'E',
            scope: {
                addLayoutFill: '='
            },
            controller: "loadController",
            controlerAs: "ctrl",
            template: '<div flex>'
                    + '<div layout="column" id="element" layout-align="center center">'
                    + '<md-progress-circular md-mode="indeterminate"></md-progress-circular>'
                    + '</div>'
                    + '</div>'
        };
    });
})();