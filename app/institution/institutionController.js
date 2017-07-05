'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, AuthService, $interval, $mdToast, $q) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;

        institutionCtrl.posts = [];

        institutionCtrl.members = [];

        institutionCtrl.followers = [];

        var currentInstitutionKey = $state.params.institutionKey;

        Object.defineProperty(institutionCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

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
            var deffered = $q.defer();
            InstitutionService.follow(currentInstitutionKey).then(function success(){
                showToast("Seguindo "+institutionCtrl.current_institution.name);
                institutionCtrl.user.follow(currentInstitutionKey);
                getFollowers();
                deffered.resolve();
            });
            return deffered.promise;
        };

        institutionCtrl.unfollow = function unfollow(){
            var deffered = $q.defer();
            if(institutionCtrl.user.isMember(institutionCtrl.current_institution.key)){
                showToast("Você não pode deixar de seguir " + institutionCtrl.current_institution.name);
                deffered.reject();
            }
            else{
                InstitutionService.unfollow(currentInstitutionKey).then(function success(){
                    showToast("Deixou de seguir "+institutionCtrl.current_institution.name);
                    institutionCtrl.user.unfollow(currentInstitutionKey);
                    getFollowers();
                    deffered.resolve();
                });
            }
            return deffered.promise;
        };
    });
})();