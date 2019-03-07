'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $state, AuthService, UtilsService,
        UserService, RequestInvitationService, $window, NotificationListenerService, STATES, SCREEN_SIZES, PushNotificationService) {
        var mainCtrl = this;
        var url_report = Config.SUPPORT_URL + "/report";
        
        mainCtrl.showSearch = false;
        mainCtrl.search_keyword = "";
        mainCtrl.user = AuthService.getCurrentUser();
        
        mainCtrl.pendingManagerMember = 0;
        mainCtrl.pendingInstInvitations = 0;
        mainCtrl.pendingInstLinksInvitations = 0;

        mainCtrl._statesWithoutFooter = [
            STATES.CREATE_EVENT
        ];
         
        mainCtrl.APP_VERSION = Config.APP_VERSION;
        
        mainCtrl.search = function search() {
            if(mainCtrl.search_keyword) {
                var search = mainCtrl.search_keyword;
                mainCtrl.search_keyword = '';
                $state.go(STATES.SEARCH, {search_keyword: search});
            }
        };
        
        /**
         * If the current device has a width greater than 450px,
         * then the search bar is shown, otherwise, the user is
         * redirected to the search page
         */
        mainCtrl.toogleSearch = function () {
            if(screen.width <= 450)  {
                $state.go(STATES.SEARCH, {search_keyword: ''});
            } else {
                mainCtrl.showSearch = !mainCtrl.showSearch;
            }
        } 

        mainCtrl.newVersionAvailable = function newVersionAvailable() {
            return AuthService.newVersionAvailable();
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('sideMenu').toggle();
        };

        mainCtrl.isSuperUser = function isSuperUser() {
            var current_institution_key = mainCtrl.user.current_institution.key;
            return mainCtrl.user.hasPermission('analyze_request_inst', current_institution_key);
        };

        mainCtrl.changeInstitution = function changeInstitution(profile) {
            mainCtrl.user = AuthService.getCurrentUser();
            mainCtrl.user.changeInstitution({'key': profile.institution_key});
            mainCtrl.getPendingTasks();
        };

        mainCtrl.settings = [{
            name: 'Início',
            stateTo: 'app.home',
            icon: 'home',
            enabled: true
        }];

        mainCtrl.goTo = function (stateName) {
            UtilsService.selectNavOption(STATES[stateName]);
            Utils.resetToolbarDisplayStyle();
        };

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        mainCtrl.goToManageMembers = function goToManageMembers(instKey){
            $state.go(STATES.MANAGE_INST_MEMBERS, {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToManageInstitutions = function goToManageInstitutions(instKey){
            $state.go(STATES.MANAGE_INST_INVITE_INST, {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToEditInstInfo = function goToEditInstInfo(instKey){
            $state.go(STATES.MANAGE_INST_EDIT, {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToReport = function goToReport() {
            $window.open(url_report);
        };

        function increaseInstInvitationsNumber(response) {
            mainCtrl.pendingInstInvitations += response.length;
        }

        function increaseInstLinksInvitationsNumber(response) {
            mainCtrl.pendingInstLinksInvitations += response.length;
        }

        mainCtrl.getPendingTasks = function getPendingTasks() {
            mainCtrl.pendingManagerMember = 0;
            mainCtrl.pendingInstInvitations = 0;

            RequestInvitationService.getRequests(mainCtrl.user.current_institution.key).then(
                function success(response) {
                    mainCtrl.pendingManagerMember = response.length;
                }, function error() {}
            );

            RequestInvitationService.getParentRequests(mainCtrl.user.current_institution.key).then(
                increaseInstLinksInvitationsNumber, function error() {}
            );
            RequestInvitationService.getChildrenRequests(mainCtrl.user.current_institution.key).then(
                increaseInstLinksInvitationsNumber, function error() {}
            );

            if(mainCtrl.isSuperUser()) {
                RequestInvitationService.getRequestsInst(mainCtrl.user.current_institution.key).then(
                    increaseInstInvitationsNumber, function error() {}
                );
            }
        };

        mainCtrl.resendEmailVerification = function resendEmailVerification() {
            AuthService.sendEmailVerification();
        };

        mainCtrl.userEmailVerified = function userEmailVerified() {
            return AuthService.emailVerified();
        };

        mainCtrl.refreshUser = function refreshUser() {
            AuthService.reload();
        };

        /** Should update version, refresh user and reload the page.
         */
        mainCtrl.updateVersion = function updateVersion() {
            mainCtrl.refreshUser();
            $window.location.reload();
        };

        /** Return correct class according currently state.
         */
        mainCtrl.getSelectedClass = function (stateName){
            return STATES[stateName] === mainCtrl._getStateName() ? "color-icon-selected-navbar" : "color-icon-navbar";
        };

        mainCtrl._getStateName = function () {
            return $state.current.name;
        };

        mainCtrl.getState = function (stateName) {
            return STATES[stateName];
        };

        /**
         * Verify if the current state is not included in the list of
         * states that don't need the footer bar
         */
        mainCtrl.showFooterBar = () => {
            return !mainCtrl._statesWithoutFooter.includes($state.current.name);
        };

        mainCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };


        /** Add new observers to listen events that user should be refresh. 
         */ 
        function notificationListener() {
            NotificationListenerService.multipleEventsListener(UserService.NOTIFICATIONS_TO_UPDATE_USER,
                mainCtrl.refreshUser);
        }

        (function main() {
            if (mainCtrl.user.name === 'Unknown') {
                $state.go(STATES.CONFIG_PROFILE, {userKey: mainCtrl.user.key});
            }
            notificationListener();
            mainCtrl.getPendingTasks();
            PushNotificationService.setupPushNotificationPermission();
        })();
    });
})();
