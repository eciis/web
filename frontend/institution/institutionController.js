'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InstitutionController", function InstitutionController($state, InstitutionService, STATES, 
        AuthService, MessageService, $sce, $mdDialog, PdfService, $rootScope, $window,
        CropImageService, ImageService, UtilsService, SCREEN_SIZES) {
        var institutionCtrl = this;

        institutionCtrl.content = document.getElementById("instPage");

        institutionCtrl.institution = null;
        institutionCtrl.isUserFollower = false;
        institutionCtrl.isMember = false;
        institutionCtrl.portfolioUrl = null;
        institutionCtrl.showFullDescription = false;
        institutionCtrl.showFullData = false;
        institutionCtrl.instLegalNature = "";
        institutionCtrl.instActuationArea = "";
        institutionCtrl.isLoadingData = true;
        institutionCtrl.isLoadingCover = false;
                
        var currentInstitutionKey = $state.params.institutionKey;
        institutionCtrl.user = AuthService.getCurrentUser();
        institutionCtrl.addPost = institutionCtrl.user.current_institution.key === currentInstitutionKey;
        const DEFAULT_INST_PHOTO = '/app/images/institution.png';

        institutionCtrl.$onInit = () => {
            institutionCtrl.canManageInst();
            loadInstitution();
        };

        /** Creating objects with the properties of the institution cover menu buttons.
         */
        function loadButtonsMenu(){
             institutionCtrl.buttonsMenu =  [
                { 
                    'label': 'CADASTRO',
                    'icon': 'assignment',
                    'onClick': institutionCtrl.goToRegistrationData,
                    'parameters': institutionCtrl.institution.key
                },
                { 
                    'label': 'VÍNCULOS',
                    'icon': 'account_balance',
                    'onClick': institutionCtrl.goToLinks,
                    'parameters': institutionCtrl.institution.key

                },
                { 
                    'label': 'MEMBROS',
                    'icon': 'account_circle',
                    'onClick': institutionCtrl.goToMembers,
                    'parameters': institutionCtrl.institution.key
                },
                { 
                    'label': 'PORTFOLIO',
                    'icon': 'description',
                    'onClick': institutionCtrl.portfolioDialog,
                    'parameters': '$event',
                    'isDisabled': _.isNil(institutionCtrl.portfolioUrl)
                },
                { 
                    'label': 'SEGUIDORES',
                    'icon': 'people',
                    'onClick': institutionCtrl.goToFollowers,
                    'parameters': institutionCtrl.institution.key
                },
                { 
                    'label': 'EVENTOS',
                    'icon': 'date_range',
                    'onClick': institutionCtrl.goToEvents,
                    'parameters': institutionCtrl.institution.key
                }
            ]
        }

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                institutionCtrl.institution = new Institution(response);
                checkIfUserIsFollower();
                institutionCtrl.checkIfUserIsMember();
                setPortfolioUrl();
                getActuationArea();
                getLegalNature();
                institutionCtrl.isLoadingData = false;
                loadPropertiesInstCover();
            }, function error() {
                $state.go(STATES.HOME);
                institutionCtrl.isLoadingData = true; 
            });
        }

        /** Created objects with button properties for the institution cover.
         */
        function loadPropertiesInstCover(){
            loadTimelineButtonsHeaderMob();
            loadButtonsMenu();
        }

        /**
         * Returns the key of the current institution
         * that the controller is responsible for.
         */
        institutionCtrl.getInstKey = () => {
            return currentInstitutionKey;
        };

        /** Create the object that contais all functions necessary in institution header,
         * when is in timeline page on mobile.
         */
        function loadTimelineButtonsHeaderMob(){
            institutionCtrl.timelineButtonsHeaderMob =  {
                goBack: institutionCtrl.goBack,
                showDescribe: null,
                follow: institutionCtrl.follow,
                unfollow: institutionCtrl.unfollow,
                cropImage: institutionCtrl.cropImage,
                showImageCover: institutionCtrl.showImageCover,
                requestInvitation: institutionCtrl.requestInvitation,
                getLimitedName: institutionCtrl.getLimitedName,
                editRegistrationData: institutionCtrl.editRegistrationData
            }
        }

        function setPortfolioUrl() {
            institutionCtrl.portfolioUrl = institutionCtrl.institution.portfolio_url;
        }

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

        institutionCtrl.showDescription = function showDescription(){
            return !Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        }

        institutionCtrl.showFollowButton = function showFollowButton() {
           return institutionCtrl.institution && !institutionCtrl.isMember && 
                institutionCtrl.institution.name !== "Ministério da Saúde" &&
                institutionCtrl.institution.name !== "Departamento do Complexo Industrial e Inovação em Saúde";
        };

        /** Go to previous page.
         */
        institutionCtrl.goBack = function goBack(){
            if(institutionCtrl.isTimelineMobile()) Utils.resetToolbarDisplayStyle();
            window.history.back();
        }

        institutionCtrl.goToInstitution = function goToInstitution(institutionKey) {
            const instKey = institutionKey || currentInstitutionKey;
            $state.go(STATES.INST_TIMELINE, {institutionKey: instKey});
        };

        institutionCtrl.goToMembers = function goToMembers(institutionKey) {
            UtilsService.selectNavOption(STATES.INST_MEMBERS, {institutionKey: institutionKey});
        };

        institutionCtrl.goToFollowers = function goToFollowers(institutionKey) {
            UtilsService.selectNavOption(STATES.INST_FOLLOWERS, {institutionKey: institutionKey});
        };

        institutionCtrl.goToRegistrationData = function goToRegistrationData(institutionKey) {
            UtilsService.selectNavOption(STATES.INST_REGISTRATION_DATA, {institutionKey: institutionKey});
        };

        institutionCtrl.goToEvents = function goToEvents(institutionKey) {
            Utils.isMobileScreen() ? goToEventsMobile(institutionKey) : goToEventsDesktop(institutionKey);
        };

        function goToEventsMobile(institutionKey) {
            UtilsService.selectNavOption(STATES.EVENTS,{institutionKey: institutionKey});
        }

        function goToEventsDesktop(institutionKey) {
            UtilsService.selectNavOption(STATES.INST_EVENTS,
                {institutionKey: institutionKey, posts: institutionCtrl.posts});
        }

        institutionCtrl.goToLinks = function goToLinks(institutionKey) {
            UtilsService.selectNavOption(STATES.INST_LINKS, {institutionKey: institutionKey});
        };
        
        institutionCtrl.goToHome = function goToHome() {
            Utils.resetToolbarDisplayStyle();
            $state.go(STATES.HOME);
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
            PdfService.showPdfDialog(ev, getPortfolioPdfObj());
        };

        function getPortfolioPdfObj() {
            return {
                name: institutionCtrl.institution.name,
                url: institutionCtrl.institution.portfolio_url
            };
        }

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
                templateUrl: InstitutionService.getRequestInvitationTemplate(),
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

        /** Verify if current state is timeline institution on mobile.
         */
        institutionCtrl.isTimelineMobile = function isTimelineMobile(){
            const inTimeline = $state.current.name == STATES.INST_TIMELINE;
            return Utils.isMobileScreen(450) && inTimeline;
        }

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

        institutionCtrl.getSelectedClass = function (stateName){
            return $state.current.name === STATES[stateName] ? "selected" : "";
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
            const isOnManageInstPage = [
                STATES.MANAGE_INST_EDIT, STATES.MANAGE_INST_MEMBERS, 
                STATES.MANAGE_INST_INVITE_INST
            ].includes($state.current.name);
            const isAdmin = institutionCtrl.user.isAdmin(currentInstitutionKey);
            if(isOnManageInstPage && !isAdmin) $state.go(STATES.HOME);
        };

        institutionCtrl.limitString = function limitString(string, size) {
            return Utils.limitString(string, size);
        };

        institutionCtrl.editRegistrationData = () => {
            $state.go(STATES.MANAGE_INST_EDIT, {institutionKey: currentInstitutionKey});
        };

        institutionCtrl.showProperty = (property) => {
            return property || "Não informado";
        };

        (function main(){
            changeCoverOnScroll();
        })();
    });

    app.controller("FollowersInstController", function InstitutionController($state, InstitutionService,
            MessageService, ProfileService){

        const followersCtrl = this;

        followersCtrl.currentInstitutionKey = $state.params.institutionKey;

        followersCtrl.followers = [];
        followersCtrl.currentFollower = "";
        followersCtrl.isLoadingFollowers = true;

        followersCtrl._getFollowers = () => {
            InstitutionService.getFollowers(followersCtrl.currentInstitutionKey).then(function success(response) {
                followersCtrl.followers = Utils.isMobileScreen(475) ?
                    Utils.groupUsersByInitialLetter(response) : response;
                followersCtrl.isLoadingFollowers = false;
            }, function error() {
                followersCtrl.isLoadingFollowers = true;
            });
        };

        followersCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        followersCtrl.$onInit = () => {
            followersCtrl._getFollowers();
        };
    });
})();