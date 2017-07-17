'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, InviteService, AuthService, $interval, $mdToast) {
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
            var promise = InstitutionService.follow(currentInstitutionKey);
            promise.then(function success(){
                showToast("Seguindo "+institutionCtrl.current_institution.name);
                institutionCtrl.user.follow(currentInstitutionKey);
                getFollowers();
            }, function error() {
                showToast('Erro ao seguir a instituição.');
            });
            return promise;
        };

        institutionCtrl.unfollow = function unfollow() {
            if(institutionCtrl.user.isMember(institutionCtrl.current_institution.key)){
                showToast("Você não pode deixar de seguir " + institutionCtrl.current_institution.name);
            }
            else{
                var promise = InstitutionService.unfollow(currentInstitutionKey);
                promise.then(function success(){
                    showToast("Deixou de seguir "+institutionCtrl.current_institution.name);
                    institutionCtrl.user.unfollow(currentInstitutionKey);
                    getFollowers();
                }, function error() {
                    showToast('Erro ao deixar de seguir instituição.');
                });
                return promise;
            }
        };

        institutionCtrl.goToManageMembers = function goToManageMembers(institutionKey){
            $state.go('app.manage_institution.invite_user', {institutionKey: institutionKey});
        };

        institutionCtrl.goToEditInfo = function goToEditInfo(institutionKey){
            $state.go('app.manage_institution.edit_info', {institutionKey: institutionKey});
        };
    });
})();