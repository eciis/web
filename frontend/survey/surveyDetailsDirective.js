(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope) {

        var surveyCtrl = this;
        surveyCtrl.post = $scope.post;

        surveyCtrl.isDeleted = function(){
            return surveyCtrl.post.state === 'deletd';
        };

        surveyCtrl.vote = function(option, bo){
            if(bo){
                option.number_votes += 1;
            } else {
                option.number_votes -= 1;
            }
            surveyCtrl.calculatePercentage(option);
        };

        surveyCtrl.calculatePercentage = function(option){
            var percentage = option.number_votes / surveyCtrl.post.number_votes;
            option.percentage = surveyCtrl.post.number_votes === 0 ? 0 : percentage;
            console.log(option.percentage);
        };
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