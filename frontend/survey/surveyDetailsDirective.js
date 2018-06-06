(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDetailsController', function($scope, SurveyService, $state, MessageService, $mdPanel) {

        var surveyCtrl = this;
        surveyCtrl.binaryOptionSelected;
        surveyCtrl.optionsSelected = [];
        var MAX_DIALOG_CHAR_QUANTITY = 55;
        var MAX_CHAR_QUANTITY = 90;

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

        surveyCtrl.votedOption = function(option){
            var voted = _.filter(option.voters,{'key': Utils.getKeyFromUrl(surveyCtrl.user.key)});
            return voted.length !== 0;
        };

        surveyCtrl.userVoted = function(){
            var voted = false;
            _.forEach(surveyCtrl.post.options, function(option) {
                (surveyCtrl.votedOption(option)) ? voted = true : null;
            });
            return voted;
        };

        surveyCtrl.isSurveyAuthor = function isSurveyAuthor() {
            return surveyCtrl.post.author_key == surveyCtrl.user.key;
        };

        surveyCtrl.timeHasBeenExpired = function timeHasBeenExpired() {
            const deadline = new Date (surveyCtrl.post.deadline);
            const currentTime = new Date((_.split(new Date().toISOString(), '.')[0]))
            return deadline < currentTime;
        };

        surveyCtrl.canVote = function(){
            var nationalTimeZone = new Date (surveyCtrl.post.deadline);
            nationalTimeZone.setHours(nationalTimeZone.getHours() - 3);
            var onTime = surveyCtrl.post.deadline ? new Date() < nationalTimeZone : 'true';
            return onTime && !surveyCtrl.userVoted() && !surveyCtrl.isdialog;
        };

        surveyCtrl.vote = function(ev){
            surveyCtrl.optionsSelected = getOptionsSelected();
            if(surveyCtrl.optionsSelected.length !== 0){
                var dialog = MessageService.showConfirmationDialog(ev,
                    'Confirmar voto', 'Seu voto será permanente. Deseja confirmar?');
                dialog.then(function() {
                    surveyCtrl.voteService().then(function () {                        
                        surveyCtrl.reloadPost();
                        syncSharedPosts();
                    });
                }, function() {
                    MessageService.showToast('Cancelado');
                });
                return dialog;
            } else {
                MessageService.showToast('Você precisa escolher alguma alternativa');
            }         
        };

        function updateSharedPost(post, updatedPost) {
            if(post.shared_post && post.shared_post.key === updatedPost.key) post.shared_post = updatedPost;
            if(post.key === updatedPost.key) post = updatedPost;
            return post;
        }

        /**
        * Function to synchronize survey posts with shared posts
        * when the user vote in survey post that is shared or vote in shared post that is survey.
        * @param {} empty - No require param.
        * @return {undefined} - Void function returns undefined.
        */
        function syncSharedPosts() {
            if(surveyCtrl.posts)
                surveyCtrl.posts = surveyCtrl.posts.map(post => updateSharedPost(post, surveyCtrl.post));
        }

        surveyCtrl.voteService = function(){
            var promise = SurveyService.vote(surveyCtrl.post, surveyCtrl.optionsSelected);
            promise.then(function sucess(response){
                surveyCtrl.post = response.data;
                addVote(surveyCtrl.optionsSelected);
                MessageService.showToast('Voto computado');
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
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
            } else if (surveyCtrl.binaryOptionSelected) {
                optionsSelected.push(surveyCtrl.binaryOptionSelected);
            }
            return optionsSelected;
        }

        function addVote(options){
            _.forEach(options, function(option) {
                surveyCtrl.post.number_votes += 1;
                option.number_votes += 1;
                calculatePercentage(option);
                var voter = {'name': surveyCtrl.user.name,
                             'photo_url': surveyCtrl.user.photo_url,
                             'key': Utils.getKeyFromUrl(surveyCtrl.user.key) };
                option.voters.push(voter);
                surveyCtrl.post.options[option.id] = option;
            });
        }

        function calculatePercentage(option){
            option.percentage =  (surveyCtrl.post.number_votes === 0) ? 0 :
                ((option.number_votes / surveyCtrl.post.number_votes) * 100).toFixed(0);
        }

        surveyCtrl.getPercentage = function getPercentage(option){
            (!option.percentage) ? calculatePercentage(option) : null;
            return option.percentage + "%";
        }

        surveyCtrl.scrollbarConfig = {
            autoHideScrollbar: false,
            theme: 'minimal-dark',
            advanced: { }
        };
        
        surveyCtrl.loadAttributes = function(){
            loadBinarySelected();
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

        surveyCtrl.getOption = function getOption(optionText) {
            return surveyCtrl.isdialog ? Utils.limitString(optionText, MAX_DIALOG_CHAR_QUANTITY) : Utils.limitString(optionText, MAX_CHAR_QUANTITY);
        };

        surveyCtrl.limitString = function limitString(string, maxSize) {
            return Utils.limitString(string, maxSize);
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
                isdialog: '=',
                isPostPage: '=',
                reloadPost: '='
            }
        };
    });
})();