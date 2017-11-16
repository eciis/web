
(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyDirectiveController', function(PostService, AuthService, MessageService, $scope, $mdDialog, $state) {

        var surveyCtrl = this;
        surveyCtrl.options = $scope.options;
        surveyCtrl.now = new Date();
        surveyCtrl.multipleChoice = false;
        var option_empty = {'text': '',
                            'number_votes': 0,
                            'voters': []
                            };

        surveyCtrl.removeOption = function(opt) {
             _.remove(surveyCtrl.options, function(option) {
              return option === opt;
            });    
        };

        surveyCtrl.addOption = function(){
            const hasOptionEmpty = surveyCtrl.getOptionEmpty() !== undefined;
            if(!hasOptionEmpty){
                surveyCtrl.options.push(angular.copy(option_empty));
            }
        };

        surveyCtrl.getOptionEmpty = function(){
            return _.find(surveyCtrl.options, option_empty);
        };

        surveyCtrl.isTyping = function() {
            return surveyCtrl.post.title;
        };

        /* This method add ids in each option and remove the options that are empty.*/
        function modifyOptions(){
            var id = 0;
            _.forEach(surveyCtrl.options, function(option) {
              if(option.text !== ''){
                option.id = id;
                id += 1;
              }else{
                surveyCtrl.removeOption(option);
              }
            });
        }

        function formateDate(){
            var date = surveyCtrl.post.deadline.toISOString();
            surveyCtrl.post.deadline = _.split(date, '.')[0];
        }

        function getTypeSurvey(){
            surveyCtrl.post.type_survey = surveyCtrl.multipleChoice ? 'multiple_choice' : 'binary';
        }

        function createSurvey(){
            modifyOptions();
            getTypeSurvey();
            surveyCtrl.post.deadline && formateDate();
            surveyCtrl.post.options = surveyCtrl.options;

            return new Post(surveyCtrl.post, surveyCtrl.user.current_institution.key);
        }

        surveyCtrl.save = function() {
            var survey = createSurvey();
            var promisse = PostService.createPost(survey).then(function success(response) {
                surveyCtrl.resetSurvey();
                surveyCtrl.posts.push(new Post(response.data));
                MessageService.showToast('Postado com sucesso!');
                surveyCtrl.callback();
                $mdDialog.hide();
            }, function error(response) {
                AuthService.reload().then(function success() {
                    $mdDialog.hide();
                    MessageService.showToast(response.data.msg);
                    $state.go('app.home');
                });
            });
            return promisse;
        };

        surveyCtrl.resetSurvey = function resetSurvey() {
            surveyCtrl.post = {};
            surveyCtrl.options = [];
            surveyCtrl.options.push(angular.copy(option_empty));
            surveyCtrl.options.push(angular.copy(option_empty));
            surveyCtrl.multipleChoice = false;
        };

        surveyCtrl.isValid = function isValid(){
            const hasOptionEmpty = surveyCtrl.getOptionEmpty() === undefined;
            return surveyCtrl.post.title && !hasOptionEmpty;
        };

    });

    app.directive("surveyDirective", function() {
        return {
            restrict: 'E',
            templateUrl: "app/survey/save_survey.html",
            controllerAs: "surveyCtrl",
            controller: "SurveyDirectiveController",
            scope: {},
            bindToController: {
                post: '=',
                posts: '=',
                user: '=',
                options: '=',
                callback: '='
            }
        };
    });
})();