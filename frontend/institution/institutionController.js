'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService,
            InviteService, AuthService, MessageService, $sce, $mdDialog, PdfService, $rootScope, $window, ProfileService, $q) {
        var institutionCtrl = this;
        var morePosts = true;
        var actualPage = 0;

        institutionCtrl.institution = null;
        institutionCtrl.posts = [];
        institutionCtrl.isUserFollower = false;
        institutionCtrl.isMember = false;
        institutionCtrl.portfolioUrl = null;
        institutionCtrl.showFullDescription = false;
        institutionCtrl.showFullData = false;
        institutionCtrl.isLoadingPosts = true;
        institutionCtrl.instLegalNature = "";
        institutionCtrl.instActuationArea = "";

        var currentInstitutionKey = $state.params.institutionKey;

        institutionCtrl.user = AuthService.getCurrentUser();
        institutionCtrl.addPost = institutionCtrl.user.current_institution.key === currentInstitutionKey;

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.institution = new Institution(response.data);
                checkIfUserIsFollower();
                institutionCtrl.checkIfUserIsMember();
                getPortfolioUrl();
                getActuationArea();
                getLegalNature();
                
            }, function error(response) {
                $state.go("app.user.home");
                MessageService.showToast(response.data.msg);
            });
        }

        function getPortfolioUrl() {
            institutionCtrl.portfolioUrl = institutionCtrl.institution.portfolio_url;
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

        institutionCtrl.limitString = function limitString(string, limit){
            return Utils.limitString(string, limit);
        };

        institutionCtrl.loadMorePosts = function loadMorePosts() {
            var deferred = $q.defer();

            if (morePosts) {
                InstitutionService.getNextPosts(currentInstitutionKey, actualPage).then(function success(response) {
                    actualPage += 1;
                    morePosts = response.data.next;

                    _.forEach(response.data.posts, function(post) {
                        institutionCtrl.posts.push(post);
                    });

                    institutionCtrl.isLoadingPosts = false;
                    deferred.resolve();
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        institutionCtrl.loadMorePosts();
        loadInstitution();

        institutionCtrl.isAdmin = function isAdmin() {
            var isAdmin = institutionCtrl.user.isAdmin(currentInstitutionKey);
            var isloggedWithInstitution = (institutionCtrl.user.current_institution.key === currentInstitutionKey);

            return isAdmin && isloggedWithInstitution;
        };

        institutionCtrl.follow = function follow(){
            var promise = InstitutionService.follow(currentInstitutionKey);
            promise.then(function success(){
                MessageService.showToast("Seguindo "+institutionCtrl.institution.name);
                var institution = institutionCtrl.institution.make();
                institutionCtrl.user.follow(institution);
                institutionCtrl.isUserFollower = true;
                AuthService.save();
            }, function error() {
                MessageService.showToast('Erro ao seguir a instituição.');
            });
            return promise;
        };

        institutionCtrl.unfollow = function unfollow() {
            if(institutionCtrl.user.isMember(institutionCtrl.institution.key)){
                MessageService.showToast("Você não pode deixar de seguir " + institutionCtrl.institution.name);
            }
            else{
                var promise = InstitutionService.unfollow(currentInstitutionKey);
                promise.then(function success(){
                    MessageService.showToast("Deixou de seguir "+institutionCtrl.institution.name);
                    institutionCtrl.user.unfollow(institutionCtrl.institution);
                    institutionCtrl.isUserFollower = false;
                    AuthService.save();
                }, function error() {
                    MessageService.showToast('Erro ao deixar de seguir instituição.');
                });
                return promise;
            }
        };

        institutionCtrl.showHideDescription = function hideDescription() {
            institutionCtrl.showFullDescription = institutionCtrl.institution.description && !institutionCtrl.showFullDescription ;
        };

        institutionCtrl.showHideData = function showHideData() {
            institutionCtrl.showFullData = !institutionCtrl.showFullData;
        };

        institutionCtrl.showFollowButton = function showFollowButton() {
           return institutionCtrl.institution && !institutionCtrl.isMember && institutionCtrl.institution.name !== "Ministério da Saúde";
        };

        institutionCtrl.goToManageMembers = function goToManageMembers(){
            institutionCtrl.stateView = "members";
            $state.go('app.manage_institution.members', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToManageInstitutions = function goToManageInstitutions(){
            institutionCtrl.stateView = "invite_inst";
            $state.go('app.manage_institution.invite_inst', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToEditInfo = function goToEditInfo(){
            institutionCtrl.stateView = "edit_info";
            $state.go('app.manage_institution.edit_info', {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.goToInstitution = function goToInstitution(institutionKey) {
            institutionCtrl.stateView = "timeline";
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
        };

        institutionCtrl.goToMembers = function goToMembers(institutionKey) {
            institutionCtrl.stateView = "members";
            $state.go('app.institution.members', {institutionKey: institutionKey});
        };

        institutionCtrl.goToFollowers = function goToFollowers(institutionKey) {
            institutionCtrl.stateView = "followers";
            $state.go('app.institution.followers', {institutionKey: institutionKey});
        };

        institutionCtrl.goToRegistrationData = function goToRegistrationData(institutionKey) {
            institutionCtrl.stateView = "registration_data";
            $state.go('app.institution.registration_data', {institutionKey: institutionKey});
        };

        institutionCtrl.goToEvents = function goToEvents(institutionKey) {
            institutionCtrl.stateView = "events";
            $state.go('app.institution.events', {institutionKey: institutionKey});
        };

        institutionCtrl.hasChildrenActive = function hasChildrenActive(institution) {
            return institution && !_.isEmpty(institution.children_institutions) && _.some(institution.children_institutions, {'state' :'active'});
        };

        institutionCtrl.hasParentActive = function hasParentActive(institution) {
            return institution && (institution.parent_institution && institution.parent_institution.state === 'active');
        };

        function checkIfUserIsFollower() {
            institutionCtrl.isUserFollower = institutionCtrl.user.isFollower(institutionCtrl.institution);
        }

        institutionCtrl.checkIfUserIsMember = function checkIfUserIsMember() {
            var institutionKey = institutionCtrl.institution.key;
            institutionCtrl.isMember = institutionCtrl.user.isMember(institutionKey);
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
            var website = institutionCtrl.institution.website_url;
            $window.open(website);
        };

        institutionCtrl.getFullAddress = function getFullAddress() {
            if(institutionCtrl.institution) {
                return institutionCtrl.institution.getFullAddress();
            }
        };

        function getLegalNature() {
            InstitutionService.getLegalNatures().then(function success(response) {
                institutionCtrl.instLegalNature = _.get(response.data, 
                    institutionCtrl.institution.legal_nature);
            });
        }

        function getActuationArea() {
            InstitutionService.getActuationAreas().then(function success(response) {
                institutionCtrl.instActuationArea = _.get(response.data, 
                   institutionCtrl.institution.actuation_area);
            });
        }

        institutionCtrl.getInfo = function getInfo(information) {
            return information ? information : "Não informado";
        };

        institutionCtrl.requestInvitation = function requestInvitation(event) {
            $mdDialog.show({
                controller: "RequestInvitationController",
                controllerAs: "requestInvCtrl",
                templateUrl: 'app/requests/request_invitation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    institution: institutionCtrl.institution
                },
                bindToController: true,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };

        function DialogController($mdDialog, portfolioUrl) {
            var ctrl = this;
            var trustedUrl = $sce.trustAsResourceUrl(portfolioUrl);
            ctrl.portfolioUrl = trustedUrl;
        }

        institutionCtrl.removeInstitution = function removeInstitution(ev) {
            institutionCtrl.stateView = "remove_inst";
            $mdDialog.show({
                templateUrl: 'app/institution/removeInstDialog.html',
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    institution: institutionCtrl.institution
                },
                controller: RemoveInstController,
                controllerAs: 'ctrl'
            });
        };

        function loadStateView(){
            institutionCtrl.stateView = $state.current.name.split(".")[2];
        }

        institutionCtrl.getSelectedItemClass = function getSelectedItemClass(state){
            return (state === institutionCtrl.stateView) ? "option-selected-left-bar":"";
        };

        function RemoveInstController($mdDialog, institution, InstitutionService, $state) {
            var ctrl = this;

            ctrl.institution = institution;

            ctrl.closeDialog = function() {
                $mdDialog.cancel();
                loadStateView();
            };

            ctrl.removeInst = function removeInst() {
                if(ctrl.removeHierarchy === undefined) {
                    MessageService.showToast("Você deve marcar uma das opções.");
                } else {
                    InstitutionService.removeInstitution(institution.key, ctrl.removeHierarchy).then(function success() {
                        institutionCtrl.user.removeProfile(institution.key, ctrl.removeHierarchy);
                        institutionCtrl.user.removeInstitution(institution.key, ctrl.removeHierarchy);
                        AuthService.save();
                        ctrl.closeDialog();
                        if(_.isEmpty(institutionCtrl.user.institutions)) {
                            AuthService.logout();
                        } else {
                            $state.go("app.user.home");
                        }
                        MessageService.showToast("Instituição removida com sucesso.");
                    });
                }
            };

            ctrl.hasOneInstitution = function hasOneInstitution() {
                return _.size(institutionCtrl.user.institutions) === 1;
            };
        }

        (function main(){
            loadStateView();
        })();
    });

    app.controller("FollowersInstController", function InstitutionController($state, InstitutionService,
            MessageService, ProfileService){

        var followersCtrl = this;
        var currentInstitutionKey = $state.params.institutionKey;

        followersCtrl.followers = [];
        followersCtrl.currentFollower = "";

        function getFollowers() {
            InstitutionService.getFollowers(currentInstitutionKey).then(function success(response) {
                followersCtrl.followers = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        followersCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        getFollowers();

    });
})();