'use strict';

(function () {
    var app = angular.module('app');

    app.directive('preventChangePage', function(SubmitFormListenerService) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                SubmitFormListenerService.addListener(attrs.preventChangePage, element.context, $scope);
            }
        };
    });
})();