(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, SurveyService, $state, MessageService) {

        var surveyCtrl = this;
        surveyCtrl.binaryOptionSelected;

        surveyCtrl.goToPost = function goToPost() {
             $state.go('app.post', {key: surveyCtrl.post.key});
        };

        surveyCtrl.isDeleted = function(){
            return surveyCtrl.post.state === 'deleted';
        };

        surveyCtrl.showRadioButton = function(){
            return surveyCtrl.post.type_survey === 'binary';
        };

        surveyCtrl.showCheckboxButton = function(){
            return surveyCtrl.post.type_survey === 'multiple_choice';
        };

        surveyCtrl.showSendButton = function(){
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

        surveyCtrl.vote = function(ev){
            var optionsSelected = getOptionsSelected();
            if(optionsSelected.length !== 0){
                var dialog = MessageService.showConfirmationDialog(ev,
                    'Confirmar voto', 'Seu voto será permanente. Deseja confirmar?');
                dialog.then(function() {
                    console.log("oolha entrou");
                    SurveyService.vote(surveyCtrl.post, optionsSelected).then(function sucess(){
                        addVote(optionsSelected);
                        calculatePercentage();
                        MessageService.showToast('Voto computado');
                    });
                }, function() {
                        MessageService.showToast('Cancelado');
                });
            } else {
                MessageService.showToast('Você precisa escolher alguma alternativa');
            }           
        };

        function loadBinarySelected(){
            if(surveyCtrl.userVoted && surveyCtrl.post.type_survey ==='binary'){
                surveyCtrl.binaryOptionSelected = _.find(surveyCtrl.post.options, 
                    function(o) { return surveyCtrl.votedOption(o); });
            }
        }

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

        function calculatePercentage(){
            if(surveyCtrl.post){
                _.forEach(surveyCtrl.post.options, function(option) {
                    var percentage = (option.number_votes / surveyCtrl.post.number_votes) * 100;
                    option.percentage = surveyCtrl.post.number_votes === 0 ? 0 : percentage.toFixed(0);
                });
            }
        }
        
        surveyCtrl.loadAttributes = function(){
            loadBinarySelected();
            calculatePercentage();
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