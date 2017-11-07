(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, SurveyService) {

        var surveyCtrl = this;
        surveyCtrl.post = $scope.post;

        surveyCtrl.isDeleted = function(){
            return surveyCtrl.post.state === 'deletd';
        };

        function getOptionsSelected(){
            return _.takeWhile(surveyCtrl.post.options, function(option) { return option.selected; });
        }

        function addVote(options){
            _.forEach(options, function(option) {
              option.number_votes += 1;
            });
        }

        surveyCtrl.vote = function(){
            var optionsSelected = getOptionsSelected();
            SurveyService.vote(surveyCtrl.post, optionsSelected).then(function sucess(data){
                addVote(optionsSelected);
            });
            surveyCtrl.calculatePercentage();
        };

        surveyCtrl.calculatePercentage = function(){
            _.forEach(surveyCtrl.post.options, function(option) {
                var percentage = option.number_votes / surveyCtrl.post.number_votes;
                option.percentage = surveyCtrl.post.number_votes === 0 ? 0 : percentage;
            });
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