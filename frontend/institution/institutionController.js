'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService,
        AuthService, MessageService, $sce, $mdDialog, PdfService, $rootScope, $window, CropImageService, ImageService) {
        var institutionCtrl = this;

        institutionCtrl.content = document.getElementById("instPage");

        institutionCtrl.institution = null;
        institutionCtrl.posts = [];
        institutionCtrl.isUserFollower = false;
        institutionCtrl.isMember = false;
        institutionCtrl.portfolioUrl = null;
        institutionCtrl.showFullDescription = false;
        institutionCtrl.showFullData = false;
        institutionCtrl.instLegalNature = "";
        institutionCtrl.instActuationArea = "";
        institutionCtrl.isLoadingData = true;
        institutionCtrl.isLoadingCover = false
        institutionCtrl.contentId = "instPage";
                
        var currentInstitutionKey = $state.params.institutionKey;
        institutionCtrl.user = AuthService.getCurrentUser();
        institutionCtrl.addPost = institutionCtrl.user.current_institution.key === currentInstitutionKey;
        const DEFAULT_INST_PHOTO = '/app/images/institution.png';

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.institution = new Institution(response);
                checkIfUserIsFollower();
                institutionCtrl.checkIfUserIsMember();
                getPortfolioUrl();
                getActuationArea();
                getLegalNature();
                institutionCtrl.isLoadingData = false;
            }, function error() {
                $state.go("app.user.home");
                institutionCtrl.isLoadingData = true; 
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

        loadInstitution();

        institutionCtrl.isAdmin = function isAdmin() {
            var isAdmin = institutionCtrl.user.isAdmin(currentInstitutionKey);
            var isloggedWithInstitution = (institutionCtrl.user.current_institution.key === currentInstitutionKey);

            return isAdmin && isloggedWithInstitution;
        };

        institutionCtrl.follow = function follow(){
            var promise = InstitutionService.follow(currentInstitutionKey);
            promise.then(function success(){
                institutionCtrl.user.follow(institutionCtrl.institution);
                institutionCtrl.isUserFollower = true;
                AuthService.save();
                MessageService.showToast("Seguindo "+ institutionCtrl.institution.name);
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
                });
                return promise;
            }
        };

        institutionCtrl.showImageCover = function showImageCover(){
                return institutionCtrl.institution && !institutionCtrl.isLoadingCover && institutionCtrl.institution.cover_photo;
        }

        institutionCtrl.showHideDescription = function hideDescription() {
            institutionCtrl.showFullDescription = institutionCtrl.institution.description && !institutionCtrl.showFullDescription ;
        };

        institutionCtrl.showHideData = function showHideData() {
            institutionCtrl.showFullData = !institutionCtrl.showFullData;
        };

        institutionCtrl.showFollowButton = function showFollowButton() {
           return institutionCtrl.institution && !institutionCtrl.isMember && 
                institutionCtrl.institution.name !== "Ministério da Saúde" &&
                institutionCtrl.institution.name !== "Departamento do Complexo Industrial e Inovação em Saúde";
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
            $state.go('app.institution.events', {institutionKey: institutionKey, posts: institutionCtrl.posts});
        };

        institutionCtrl.goToLinks = function goToLinks(institutionKey) {
            institutionCtrl.stateView = "institutional_links";
            $state.go('app.institution.institutional_links', {institutionKey: institutionKey});
        };

        institutionCtrl.goToHome = function goToHome() {
            $state.go('app.user.home');
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
            website = Utils.addHttpsToUrl(website, [website]);
            $window.open(website, '_blank');
        };

        institutionCtrl.getFullAddress = function getFullAddress() {
            if(institutionCtrl.institution) {
                return institutionCtrl.institution.getFullAddress();
            }
        };

        function getLegalNature() {
            InstitutionService.getLegalNatures().then(function success(response) {
                institutionCtrl.instLegalNature = _.get(response, 
                    institutionCtrl.institution.legal_nature);
            });
        }

        function getActuationArea() {
            InstitutionService.getActuationAreas().then(function success(response) {
                institutionCtrl.instActuationArea = _.get(response, 
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

        institutionCtrl.cropImage = function cropImage(imageFile, event) {
            CropImageService.crop(imageFile, event, 'rectangle').then(function success(croppedImage) {
                institutionCtrl.addImage(croppedImage);
            }, function error() {
                institutionCtrl.file = null;
            });
        };

        institutionCtrl.addImage = function (image) {
            var newSize = 800;

            ImageService.compress(image, newSize).then(function success(data) {
                institutionCtrl.cover_photo = data;
                ImageService.readFile(data, setImage);
                institutionCtrl.file = null;
                institutionCtrl.saveImage();
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        institutionCtrl.saveImage = function saveImage() {
            if (institutionCtrl.cover_photo) {
                institutionCtrl.isLoadingCover = true;
                ImageService.saveImage(institutionCtrl.cover_photo).then(function success(data) {
                    updateCoverImage(data);
                }, function error(response) {
                    MessageService.showToast(response.msg);
                });
            }
        };

        function updateCoverImage(data) {
            var patch = [{ op: "replace", path: "/cover_photo", value: data.url }];
            InstitutionService.update(institutionCtrl.institution.key, patch).then(function success(response) {
                institutionCtrl.institution = response;
                institutionCtrl.isLoadingCover = false;
            });
        }

        function setImage(image) {
            $rootScope.$apply(function () {
                institutionCtrl.cover_photo = image.src;
            });
        }

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
                    institution: institutionCtrl.institution,
                    loadStateView: loadStateView
                },
                controller: "RemoveInstController",
                controllerAs: 'removeInstCtrl'
            });
        };

        function loadStateView(){
            institutionCtrl.stateView = $state.current.name.split(".")[2];
        }

        institutionCtrl.getSelectedItemClass = function getSelectedItemClass(state){
            return (state === institutionCtrl.stateView) ? "option-selected-left-bar":"";
        };

        function changeCoverOnScroll() {
            var instPage = document.getElementById("instPage");
            var instName = document.getElementById("instName");
            const FULL = 1, NONE = 0;
 
            instPage && instPage.addEventListener('scroll', function() {
                var isOverInstName = instPage.scrollTop > instName.offsetTop;
                var opacity = isOverInstName ? FULL : NONE;
                setElementsOpacity(opacity);
                changeLeftMenuStyle(isOverInstName);
            });
        }
        
        function setElementsOpacity(opacity) {
            document.getElementById("floatingCoverGtLg").style.opacity = opacity;
            document.getElementById("floatingCoverLg").style.opacity = opacity;
            document.getElementById("floatingCoverMd").style.opacity = opacity;
            document.getElementById("floatingCoverXs").style.opacity = opacity;
        }

        function changeLeftMenuStyle(isToFloat) {
            const DEFAULT_WIDTH = '100%';
            const MEDIUM_WIDTH = 960, LARGE_WIDTH = 1280, EXTRA_LARGE_WIDTH = 1920; 
            var leftMenu = document.getElementById("leftMenu");
            var isMd = screen.width >= MEDIUM_WIDTH && screen.width < LARGE_WIDTH;
            var isLg = screen.width >= LARGE_WIDTH && screen.width < EXTRA_LARGE_WIDTH;
            var isGtLg = screen.width >= EXTRA_LARGE_WIDTH;
            var width = DEFAULT_WIDTH;

            if(isToFloat) {
                if(isMd) width = '25%';
                if(isLg) width = '22.5%';
                if(isGtLg) width = '17.5%';
                leftMenu.classList.add('floating-menu')
            } else {
                leftMenu.classList.remove('floating-menu');
            }

            leftMenu.style.width = width;
        }
        
        institutionCtrl.getPhoto = function getPhoto() {
            return institutionCtrl.institution && institutionCtrl.institution.photo_url || DEFAULT_INST_PHOTO;
        };

        institutionCtrl.getLimitedName = function getLimitedName(limit) {
            return institutionCtrl.institution && Utils.limitString(institutionCtrl.institution.name, limit);
        };

        institutionCtrl.canManageInst = function canManageInst() {
            return institutionCtrl.user.isAdmin(currentInstitutionKey) ? true : $state.go('app.user.home');
        };

        institutionCtrl.limitString = function limitString(string, size) {
            return Utils.limitString(string, size);
        };

        (function main(){
            loadStateView();
            changeCoverOnScroll();
        })();
    });

    app.controller("FollowersInstController", function InstitutionController($state, InstitutionService,
            MessageService, ProfileService){

        var followersCtrl = this;
        var currentInstitutionKey = $state.params.institutionKey;

        followersCtrl.followers = [];
        followersCtrl.currentFollower = "";
        followersCtrl.isLoadingFollowers = true;

        function getFollowers() {
            InstitutionService.getFollowers(currentInstitutionKey).then(function success(response) {
                followersCtrl.followers = response;
                followersCtrl.isLoadingFollowers = false;
            }, function error() {
                followersCtrl.isLoadingFollowers = true;
            });
        }

        followersCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        getFollowers();

    });
})();