(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, SurveyService) {

        var surveyCtrl = this;
        surveyCtrl.binaryOptionSelected;

        surveyCtrl.isDeleted = function(){
            return surveyCtrl.post.state === 'deleted';
        };

        surveyCtrl.showRadioButton = function(){
            return surveyCtrl.post.type_survey === 'binary';
        };

        surveyCtrl.showCheckboxButton = function(){
            return surveyCtrl.post.type_survey === 'multiple_choice';
        };

        surveyCtrl.votedOption = function(option){
            return _.includes(option.voters, Utils.getKeyFromUrl(surveyCtrl.user.key));
        };

        surveyCtrl.userVoted = function(){
            var voted = false;
            _.forEach(surveyCtrl.post.options, function(option) {
                if(surveyCtrl.votedOption(option)) {voted = true;}
            });
            return voted;
        };

        function getOptionsSelected(){
            var optionsSelected = [];
            if(surveyCtrl.post.type_survey === 'multiple_choice'){
                _.forEach(surveyCtrl.post.options, function(option) {
                    option.selected && optionsSelected.push(option);
                });
            } else {
                optionsSelected.push(surveyCtrl.binaryOptionSelected);
            }
            return optionsSelected;
        }

        function addVote(options){
            _.forEach(options, function(option) {
                surveyCtrl.post.number_votes += 1;
                option.number_votes += 1;
                option.voters.push(Utils.getKeyFromUrl(surveyCtrl.user.key));
            });
        }

        surveyCtrl.vote = function(){
            var optionsSelected = getOptionsSelected();
            SurveyService.vote(surveyCtrl.post, optionsSelected).then(function sucess(){
                addVote(optionsSelected);
                surveyCtrl.calculatePercentage();
            });
        };

        surveyCtrl.calculatePercentage = function(){
            if(surveyCtrl.post){
                _.forEach(surveyCtrl.post.options, function(option) {
                    var percentage = (option.number_votes / surveyCtrl.post.number_votes) * 100;
                    option.percentage = surveyCtrl.post.number_votes === 0 ? 0 : percentage.toFixed(0);
                    
                });
            }
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
                user: '='
            }
        };
    });
})();