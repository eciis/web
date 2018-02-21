
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

        surveyCtrl.changeOption = function(option) {
            option.text ? surveyCtrl.addOption() : surveyCtrl.options.length > 2 && surveyCtrl.removeOption(option);
        }

        surveyCtrl.addOption = function(){
            const hasOptionEmpty = surveyCtrl.getOptionEmpty() !== undefined;
            surveyCtrl.options.length < 10 && !hasOptionEmpty && surveyCtrl.options.push(angular.copy(option_empty));
        };

        surveyCtrl.getOptionEmpty = function(){
            return _.find(surveyCtrl.options, option_empty);
        };

        surveyCtrl.isTyping = function() {
            return surveyCtrl.post.title;
        };

        /* This method add ids in each option and remove the options that are empty.*/
        function modifyOptions(){
            let id = 0;
            surveyCtrl.options.map(option => option.text ? option.id = id++ : surveyCtrl.removeOption(option));
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
            console.log(surveyCtrl.options);
            return new Post(surveyCtrl.post, surveyCtrl.user.current_institution.key);
        }

        surveyCtrl.save = function() {
            if(surveyCtrl.isValid()) {
                var survey = createSurvey();
                var promise = PostService.createPost(survey).then(function success(response) {
                    surveyCtrl.resetSurvey();
                    surveyCtrl.posts.push(new Post(response.data));
                    MessageService.showToast('Postado com sucesso!');
                    surveyCtrl.callback();
                    $mdDialog.hide();
                }, function error(response) {
                    AuthService.reload().then(function success() {
                        $mdDialog.hide();
                        MessageService.showToast(response.data.msg);
                        $state.go("app.user.home");
                    });
                });
                return promise;
            } else {
                MessageService.showToast("Enquete deve ter no mínimo 2 opções e data limite definida");
            }
        };

        surveyCtrl.resetSurvey = function resetSurvey() {
            surveyCtrl.post = {};
            surveyCtrl.options = [];
            surveyCtrl.options.push(angular.copy(option_empty));
            surveyCtrl.options.push(angular.copy(option_empty));
            surveyCtrl.multipleChoice = false;
            $mdDialog.hide();
        };

        surveyCtrl.isValid = function isValid(){
            const notEnoughOptions = surveyCtrl.options.filter(option => option.text).length < 2;
            return surveyCtrl.post.title && !notEnoughOptions && surveyCtrl.post.deadline;
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