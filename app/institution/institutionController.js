'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function MainController($state, InstitutionService, $interval, $mdToast) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;

        var current_institution_key = $state.params.institutionKey;

        institutionCtrl.posts = [];

        var intervalPromise;

        var loadPosts = function loadPosts() {
            InstitutionService.getTimeline(current_institution_key).then(function success(response) {
                institutionCtrl.posts = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        var loadInstitution = function loadInstitution() {
            InstitutionService.getInstitution(current_institution_key).then(function success(response) {
                institutionCtrl.current_institution = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        loadPosts();
        loadInstitution();

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }
        
    });
})();