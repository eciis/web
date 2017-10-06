'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService,
            InviteService, AuthService, MessageService, $sce, $mdDialog, PdfService, $rootScope, $window, ProfileService) {
        var institutionCtrl = this;

        institutionCtrl.current_institution = null;
        institutionCtrl.posts = [];
        institutionCtrl.members = [];
        institutionCtrl.followers = [];
        institutionCtrl.isUserFollower = false;
        institutionCtrl.isMember = false;
        institutionCtrl.portfolioUrl = null;
        institutionCtrl.showFullDescription = false;
        institutionCtrl.isLoadingPosts = true;

        institutionCtrl.legal_natures = {
            "public": "Pública",
            "private": "Privada",
            "philanthropic": "Filantrópica"
        };

        institutionCtrl.occupation_areas = {
            "official laboratories":"Laboratórios Oficiais",
            "government agencies":"Ministérios e outros Órgãos do Governo",
            "funding agencies":"Agências de Fomento",
            "research institutes":"Institutos de Pesquisa",
            "colleges":"Universidades",
            "other":"Outra"
        };

        var currentInstitutionKey = $state.params.institutionKey;

        institutionCtrl.user = AuthService.getCurrentUser();
        institutionCtrl.addPost = institutionCtrl.user.current_institution.key === currentInstitutionKey;

        function loadPosts() {
            InstitutionService.getTimeline(currentInstitutionKey).then(function success(response) {
                institutionCtrl.posts = response.data;
                institutionCtrl.isLoadingPosts = false;
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
                PdfService.getReadableURL(institutionCtrl.portfolioUrl, setPortifolioURL)
                    .then(function success() {
                }, function error(response) {
                    MessageService.showToast(response.data.msg);

                });
            }
        }

        function setPortifolioURL(url) {
            institutionCtrl.portfolioUrl = url;
        }

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

        institutionCtrl.showDescription = function showDescription() {
            institutionCtrl.showFullDescription = true;
        };

        institutionCtrl.hideDescription = function hideDescription() {
            institutionCtrl.showFullDescription = false;
        };

        institutionCtrl.goToManageMembers = function goToManageMembers(){
            $state.go('app.manage_institution.members', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToManageInstitutions = function goToManageInstitutions(){
            $state.go('app.manage_institution.invite_inst', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToEditInfo = function goToEditInfo(){
            $state.go('app.manage_institution.edit_info', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        institutionCtrl.hasChildrenActive = function hasChildrenActive(institution) {
            return !_.isEmpty(institution.children_institutions) && _.some(institution.children_institutions, {'state' :'active'});
        };

        institutionCtrl.hasParentActive = function hasParentActive(institution) {
            return (institution.parent_institution && institution.parent_institution.state === 'active');
        };

        function checkIfUserIsFollower() {
            institutionCtrl.isUserFollower = institutionCtrl.user.isFollower(institutionCtrl.current_institution);
        }

        institutionCtrl.checkIfUserIsMember = function checkIfUserIsMember() {
            var institutionKey = institutionCtrl.current_institution.key;
            institutionCtrl.isMember = institutionCtrl.user.isMember(institutionKey);
        };

        institutionCtrl.removeInstitution = function removeInstitution(ev) {
            $mdDialog.show({
                templateUrl: 'app/institution/removeInstDialog.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    institutionKey: institutionCtrl.current_institution.key
                },
                controller: RemoveInstController,
                controllerAs: 'ctrl'
            });
        };

        institutionCtrl.portfolioDialog = function(ev) {
            $mdDialog.show({
                templateUrl: 'app/institution/portfolioDialog.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    portfolioUrl: institutionCtrl.portfolioUrl
                },
                controller: DialogController,
                controllerAs: 'ctrl'
            });
        };

        institutionCtrl.openWebsite = function openWebsite() {
            var website = institutionCtrl.current_institution.website_url;
            $window.open(website);
        };

        institutionCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        institutionCtrl.getFullAddress = function getFullAddress() {
            if(institutionCtrl.current_institution) {
                return institutionCtrl.current_institution.getFullAddress();
            }
        };

        function DialogController($mdDialog, portfolioUrl) {
            var ctrl = this;
            var trustedUrl = $sce.trustAsResourceUrl(portfolioUrl);
            ctrl.portfolioUrl = trustedUrl;
        }

        function RemoveInstController($mdDialog, institutionKey, InstitutionService, $state) {
            var ctrl = this;

            ctrl.closeDialog = function() {
                $mdDialog.cancel();
            };

            ctrl.removeInst = function removeInst() {
                if(ctrl.removeHierarchy === undefined) {
                    MessageService.showToast("Você deve marcar uma das opções.");
                } else {
                    InstitutionService.removeInstitution(institutionKey, ctrl.removeHierarchy).then(function success() {
                        institutionCtrl.user.removeInstitution(institutionKey, ctrl.removeHierarchy);
                        AuthService.save();
                        ctrl.closeDialog();
                        if(_.isEmpty(institutionCtrl.user.institutions)) {
                            $state.go('user_inactive');
                        } else {
                            $state.go('app.home');
                        }
                        MessageService.showToast("Instituição removida com sucesso.");
                    });
                }
            };
        }
    });
})();