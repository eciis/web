'use strict';

(function () {
    var app = angular.module('app');

    app.directive('submitFormWatch', function(SubmitFormListenerService) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                console.log(attrs);
                SubmitFormListenerService.addListener(attrs.submitFormWatch, element.context, $scope);
            }
        };
    });
})();