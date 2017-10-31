(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, $mdDialog, $state) {

        var surveyCtrl = this;
    });
    
    app.directive("surveyDetails", function() {
        return {
            restrict: 'E',
            templateUrl: "app/survey/survey_details.html",
            controllerAs: "surveyCtrl",
            controller: "SurveyDetailsController",
            scope: {},
            bindToController: {
                post: '=',
                posts: '=',
                user: '=',
                institution: '='
            }
        };
    });
})();