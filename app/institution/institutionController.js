'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, 
            InviteService, AuthService, MessageService, $sce, $mdDialog, PdfService, $rootScope, $window) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;
        institutionCtrl.posts = [];
        institutionCtrl.members = [];
        institutionCtrl.followers = [];
        institutionCtrl.isUserFollower = false;
        institutionCtrl.isMember = false;
        institutionCtrl.portfolioUrl = null;

        var currentInstitutionKey = $state.params.institutionKey;

        institutionCtrl.user = AuthService.getCurrentUser();

        function loadPosts() {
            InstitutionService.getTimeline(currentInstitutionKey).then(function success(response) {
                institutionCtrl.posts = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.current_institution = new Institution(response.data);
                getMembers();
                getFollowers();
                checkIfUserIsFollower();
                institutionCtrl.checkIfUserIsMember();
                getPortfolioUrl();
            }, function error(response) {
                $state.go("app.home");
                MessageService.showToast(response.data.msg);
            });
        }

        function getPortfolioUrl() {
            institutionCtrl.portfolioUrl = institutionCtrl.current_institution.portfolio_url;
            if(institutionCtrl.portfolioUrl) {
                PdfService.getReadableURL(institutionCtrl.portfolioUrl, setPortifolioURL);
            }
        }

        // TODO: Use this function to show pdf on dialog - Author: Ruan Eloy - 17/08/17
        function setPortifolioURL(url) {
            $rootScope.$apply(function() {
                institutionCtrl.portfolioUrl = url;
            });
        }

        institutionCtrl.openPortfolio = function openPortfolio() {
            if(institutionCtrl.portfolioUrl) {
                $window.open(institutionCtrl.portfolioUrl, '_blank');
            }
        };

        function getMembers() {
            InstitutionService.getMembers(currentInstitutionKey).then(function success(response) {
                institutionCtrl.members = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function getFollowers() {
            InstitutionService.getFollowers(currentInstitutionKey).then(function success(response) {
                institutionCtrl.followers = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        loadPosts();
        loadInstitution();

        institutionCtrl.isAdmin = function isAdmin() {
            var isAdmin = institutionCtrl.user.isAdmin(currentInstitutionKey);
            var isloggedWithInstitution = (institutionCtrl.user.current_institution.key === currentInstitutionKey);

            return isAdmin && isloggedWithInstitution;
        };

        institutionCtrl.follow = function follow(){
            var promise = InstitutionService.follow(currentInstitutionKey);
            promise.then(function success(){
                MessageService.showToast("Seguindo "+institutionCtrl.current_institution.name);
                var institution = institutionCtrl.current_institution.make();
                institutionCtrl.user.follow(institution);
                institutionCtrl.isUserFollower = true;
                AuthService.save();
                getFollowers();
            }, function error() {
                MessageService.showToast('Erro ao seguir a instituição.');
            });
            return promise;
        };

        institutionCtrl.unfollow = function unfollow() {
            if(institutionCtrl.user.isMember(institutionCtrl.current_institution.key)){
                MessageService.showToast("Você não pode deixar de seguir " + institutionCtrl.current_institution.name);
            }
            else{
                var promise = InstitutionService.unfollow(currentInstitutionKey);
                promise.then(function success(){
                    MessageService.showToast("Deixou de seguir "+institutionCtrl.current_institution.name);
                    institutionCtrl.user.unfollow(institutionCtrl.current_institution);
                    institutionCtrl.isUserFollower = false;
                    AuthService.save();
                    getFollowers();
                }, function error() {
                    MessageService.showToast('Erro ao deixar de seguir instituição.');
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

        institutionCtrl.goToInstitution = function goToInstitution() {
            $state.go('app.institution', {institutionKey: currentInstitutionKey});
        };

        function checkIfUserIsFollower() {
            institutionCtrl.isUserFollower = institutionCtrl.user.isFollower(institutionCtrl.current_institution);
        }

        institutionCtrl.checkIfUserIsMember = function checkIfUserIsMember() {
            var institutionKey = institutionCtrl.current_institution.key;
            institutionCtrl.isMember = institutionCtrl.user.isMember(institutionKey);
        };

        institutionCtrl.portfolioDialog = function(ev) {
            $mdDialog.show({
                templateUrl: 'institution/portfolioDialog.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    portfolioUrl: institutionCtrl.portfolioUrl
                },
                controller: DialogController,
                controllerAs: 'ctrl'
            });
        };

        function DialogController($mdDialog, portfolioUrl) {
            var ctrl = this;
            var trustedUrl = $sce.trustAsResourceUrl(portfolioUrl);
            ctrl.portfolioUrl = trustedUrl;
        }
    });
})();