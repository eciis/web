'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, InviteService, AuthService, $interval, $mdToast) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;
        institutionCtrl.posts = [];
        institutionCtrl.followers = [];
        institutionCtrl.isUserFollower = false;

        var currentInstitutionKey = $state.params.institutionKey;

        institutionCtrl.user = AuthService.getCurrentUser();

        function loadPosts() {
            InstitutionService.getTimeline(currentInstitutionKey).then(function success(response) {
                institutionCtrl.posts = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.current_institution = new Institution(response.data);
                getMembers();
                getFollowers();
                checkIfUserIsFollower();
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

        institutionCtrl.isAdmin = function isAdmin() {
            var isAdmin = institutionCtrl.user.isAdmin(currentInstitutionKey);
            var isloggedWithInstitution = (institutionCtrl.user.current_institution.key === currentInstitutionKey);

            return isAdmin && isloggedWithInstitution;
        };

        institutionCtrl.isMember = function isMember() {
            return institutionCtrl.user.isMember(institutionCtrl.current_institution.key);
        };


        institutionCtrl.follow = function follow(){
            var promise = InstitutionService.follow(currentInstitutionKey);
            promise.then(function success(){
                showToast("Seguindo "+institutionCtrl.current_institution.name);
                var institution = institutionCtrl.current_institution.make();
                institutionCtrl.user.follow(institution);
                institutionCtrl.isUserFollower = true;
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
                    institutionCtrl.user.unfollow(institutionCtrl.current_institution);
                    institutionCtrl.isUserFollower = false;
                    getFollowers();
                }, function error() {
                    showToast('Erro ao deixar de seguir instituição.');
                });
                return promise;
            }
        };

        institutionCtrl.goToManageMembers = function goToManageMembers(){
            $state.go('app.manage_institution.invite_user', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToManageInstitutions = function goToManageInstitutions(){
            $state.go('app.manage_institution.invite_inst', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToEditInfo = function goToEditInfo(){
            $state.go('app.manage_institution.edit_info', {institutionKey: currentInstitutionKey});
        };

        function checkIfUserIsFollower() {
            institutionCtrl.isUserFollower = institutionCtrl.user.isFollower(institutionCtrl.current_institution);
        }
    });
})();