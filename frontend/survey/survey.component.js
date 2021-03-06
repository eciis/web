
(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('SurveyComponentController', function(PostService, AuthService, MessageService, 
        $scope, $mdDialog, $state, SubmitFormListenerService, $rootScope, POST_EVENTS, STATES) {

        var surveyCtrl = this;

        surveyCtrl.now = new Date();
        surveyCtrl.multipleChoice = false;
        var option_empty = {'text': '',
                            'number_votes': 0,
                            'voters': []
                            };        

        const MIN_QUANTITY_OPTION = (Utils.isMobileScreen() && screen.height > 730) ? 5 : 2;

        surveyCtrl.removeOption = function(opt) {
             _.remove(surveyCtrl.options, function(option) {
              return option === opt;
            });    
        };

        surveyCtrl.changeOption = function(option) {
            option.text ? surveyCtrl.addOption() : 
            surveyCtrl.options.length > MIN_QUANTITY_OPTION && surveyCtrl.removeOption(option);
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

        surveyCtrl.isSmallScreen = function() {
            return screen.width < 600;
        };

        /**
         * Remove empty objects in the options array and add 'id' property in all objects.
         * @private
         */
        surveyCtrl._processOptions = () => {
            surveyCtrl.options = surveyCtrl.options
                .filter(option => option.text)
                .map((option, index) => {option.id = index; return option;});
        };

        function formateDate(){
            var date = surveyCtrl.post.deadline.toISOString();
            surveyCtrl.post.deadline = _.split(date, '.')[0];
        }

        function getTypeSurvey(){
            surveyCtrl.post.type_survey = surveyCtrl.multipleChoice ? 'multiple_choice' : 'binary';
        }

        function createSurvey(){
            surveyCtrl._processOptions();
            getTypeSurvey();
            surveyCtrl.post.deadline && formateDate();
            surveyCtrl.post.options = surveyCtrl.options;
            return new Post(surveyCtrl.post, surveyCtrl.user.current_institution.key);
        }

        surveyCtrl.save = function() {
            if(surveyCtrl.isValid()) {
                var survey = createSurvey();
                var promise = PostService.createPost(survey).then(function success(response) {
                    surveyCtrl.resetSurvey();
                    $rootScope.$emit(POST_EVENTS.NEW_POST_EVENT_TO_UP, new Post(response));
                    MessageService.showInfoToast('Postado com sucesso!');
                    surveyCtrl.callback();
                    const postAuthorPermissions = ["remove_post"];
                    surveyCtrl.user.addPermissions(postAuthorPermissions, response.key);
                    $mdDialog.hide();
                    unobserveNewPost();
                }, function error() {
                    AuthService.reload().then(function success() {
                        $mdDialog.hide();
                        $state.go(STATES.HOME);
                    });
                });
                return promise;
            } else {
                MessageService.showErrorToast("Enquete deve ter no mínimo 2 opções e data limite definida");
            }
        };

        surveyCtrl.resetSurvey = function resetSurvey() {
            surveyCtrl.post = {};
            defaultoptions();
            surveyCtrl.multipleChoice = false;
            unobserveNewPost();
            $mdDialog.hide();
        };

        surveyCtrl.isValid = function isValid(){
            const notEnoughOptions = surveyCtrl.options.filter(option => option.text).length < 2;
            return surveyCtrl.post.title && !notEnoughOptions && surveyCtrl.post.deadline;
        };

        function defaultoptions(){
            surveyCtrl.options = [];
            for (let i = 0; i < MIN_QUANTITY_OPTION; i++) { 
                surveyCtrl.options.push(angular.copy(option_empty))
            }
        }

        function unobserveNewPost() {
            SubmitFormListenerService.unobserve("postCtrl.post");
        }

        surveyCtrl.$onInit = function() {
            defaultoptions();
        }
    });

    /**
     * Function to return a correct template url to show in desktop screen or mobile screen.
     * @returns {String} The string containing the url path to html file that will be displayed in view.
     */
    function getTemplateUrl() {
        return Utils.isMobileScreen() ? "app/survey/save_survey_mobile.html" : "app/survey/save_survey.html";
    };

    app.component("surveyComponent", {
        templateUrl: getTemplateUrl(),
        controllerAs: "surveyCtrl",
        controller: "SurveyComponentController",
        bindings: {
            post: '=',
            user: '=',
            callback: '='
        }
    });
})();