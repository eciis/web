'use strict';

(function () {
    var app = angular.module('app');

    app.directive('preventStateChange', function(SubmitFormListenerService) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                SubmitFormListenerService.addListener(attrs.preventStateChange, element[0], $scope);
            }
        };
    });
})();