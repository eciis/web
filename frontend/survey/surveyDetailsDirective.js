(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, SurveyService, $state, MessageService, $mdPanel) {

        var surveyCtrl = this;
        surveyCtrl.binaryOptionSelected;
        surveyCtrl.optionsSelected = [];

        surveyCtrl.goToPost = function goToPost() {
             $state.go('app.post', {key: surveyCtrl.post.key});
        };

        surveyCtrl.selectedMultipleOption = function selectBinaryOption() {
            var optionsSelected = getMultipleChoice();
            return optionsSelected.length !== 0;
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

        surveyCtrl.votedOption = function(option){
            var voted = _.filter(option.voters,{'key': Utils.getKeyFromUrl(surveyCtrl.user.key)});
            return voted.length !== 0;
        };

        surveyCtrl.userVoted = function(){
            var voted = false;
            _.forEach(surveyCtrl.post.options, function(option) {
                if(surveyCtrl.votedOption(option)) {voted = true;}
            });
            return voted;
        };

        surveyCtrl.canVote = function(){
            var nationalTimeZone = new Date (surveyCtrl.post.deadline);
            nationalTimeZone.setHours(nationalTimeZone.getHours() - 3);
            var onTime = surveyCtrl.post.deadline ? new Date() < nationalTimeZone : 'true';
            return onTime && !surveyCtrl.userVoted();
        };

        surveyCtrl.vote = function(ev){
            surveyCtrl.optionsSelected = getOptionsSelected();
            if(surveyCtrl.optionsSelected.length !== 0){
                var dialog = MessageService.showConfirmationDialog(ev,
                    'Confirmar voto', 'Seu voto será permanente. Deseja confirmar?');
                dialog.then(function() {
                    surveyCtrl.voteService();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
            } else {
                MessageService.showToast('Você precisa escolher alguma alternativa');
            }         
        };

         surveyCtrl.voteService = function(){
            var promisse = SurveyService.vote(surveyCtrl.post, surveyCtrl.optionsSelected);
            promisse.then(function sucess(){
                addVote(surveyCtrl.optionsSelected);
                calculatePercentage();
                MessageService.showToast('Voto computado');
            });
            return promisse;          
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
                optionsSelected = getMultipleChoice();
            } else {
                optionsSelected.push(surveyCtrl.binaryOptionSelected);
            }
            return optionsSelected;
        }

        function getMultipleChoice() {
            var optionsSelected = [];
            _.forEach(surveyCtrl.post.options, function(option) {
                option.selected && optionsSelected.push(option);
            });
            return optionsSelected;
        }

        function addVote(options){
            _.forEach(options, function(option) {
                surveyCtrl.post.number_votes += 1;
                option.number_votes += 1;
                var voter = {'name': surveyCtrl.user.name,
                             'photo_url': surveyCtrl.user.photo_url,
                             'key': Utils.getKeyFromUrl(surveyCtrl.user.key) };
                option.voters.push(voter);
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

        surveyCtrl.scrollbarConfig = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            advanced: { }
        };
        
        surveyCtrl.loadAttributes = function(){
            loadBinarySelected();
            calculatePercentage();
        };

        surveyCtrl.showMenu = function(ev, option) {
            if(option.voters.length > 0){
                var position = $mdPanel.newPanelPosition()
                .relativeTo(ev.target)
                .addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW);

                var config = {
                    attachTo: angular.element(document.body),
                    controller: 'SurveyDetailsController',
                    controllerAs: 'ctrl',
                    templateUrl: 'app/survey/panel-voters.html',
                    panelClass: 'demo-menu-example',
                    locals: {
                      'option': option,
                    },
                    position: position,
                    openFrom: ev,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: false,
                    zIndex: 2
                  };

                  $mdPanel.open(config);
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