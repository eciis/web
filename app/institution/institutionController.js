'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, $interval, $mdToast) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;

        institutionCtrl.posts = [];

        institutionCtrl.members = [];

        institutionCtrl.followers = [];

        var currentInstitutionKey = $state.params.institutionKey;

        function loadPosts() {
            InstitutionService.getTimeline(currentInstitutionKey).then(function success(response) {
                institutionCtrl.posts = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.current_institution = response.data;
                getMembers();
                getFollowers();
            }, function error(response) {
                $state.go("app.home");
                showToast(response.data.msg);
            });
        }

        function getMembers() {
            InstitutionService.getMembers(currentInstitutionKey).then(function success(response) {
                institutionCtrl.members = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function getFollowers() {
            InstitutionService.getFollowers(currentInstitutionKey).then(function success(response) {
                institutionCtrl.followers = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

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

        institutionCtrl.follow = function follow(){
            InstitutionService.follow(currentInstitutionKey).then(function success(){
                showToast("Seguindo "+institutionCtrl.current_institution.name);
            });
        };
    });
})();