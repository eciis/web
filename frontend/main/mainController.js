'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $state, AuthService,
        UserService, RequestInvitationService, $mdMenu, $window, NotificationListenerService) {
        var mainCtrl = this;
        var url_report = Config.SUPPORT_URL + "/report";
        
        mainCtrl.showSearch = false;
        mainCtrl.search_keyword = "";
        mainCtrl.user = AuthService.getCurrentUser();
        
        mainCtrl.pendingManagerMember = 0;
        mainCtrl.pendingInstInvitations = 0;
        mainCtrl.pendingInstLinksInvitations = 0;

        mainCtrl.stateView =  $state.current.name;
        
        mainCtrl.APP_VERSION = Config.APP_VERSION;
        
        mainCtrl.search = function search() {
            if(mainCtrl.search_keyword) {
                var search = mainCtrl.search_keyword;
                mainCtrl.search_keyword = '';
                $state.go('app.user.search', {search_keyword: search});
            }
        };
        
        /**
         * If the current device has a width greater than 450px,
         * then the search bar is shown, otherwise, the user is
         * redirected to the search page
         */
        mainCtrl.toogleSearch = function () {
            if(screen.width <= 450)  {
                $state.go('app.user.search', {search_keyword: ''});
            } else {
                mainCtrl.showSearch = !mainCtrl.showSearch;
            }
        } 

        mainCtrl.newVersionAvailable = function newVersionAvailable() {
            return AuthService.newVersionAvailable();
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.isActive = function isActive(inst) {
            if (mainCtrl.user.current_institution.key == inst.key) {
                return true;
            }
            return false;
        };

        mainCtrl.isAdmin = function isAdmin(keyInstitution) {
            if (mainCtrl.user && mainCtrl.user.isAdmin(keyInstitution)){
                return true;
            }
            return false;
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

        mainCtrl.goTo = function goTo(state) {
            $state.go(state);
            mainCtrl.toggle();
        };

        mainCtrl.goInvite = function goInvite() {
            $state.go('app.user.invite_inst');
        };

        mainCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
            mainCtrl.toggle();
        };

        mainCtrl.goEvents = function goEvents(){
            $state.go('app.user.events');
        };

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        mainCtrl.goToManageMembers = function goToManageMembers(instKey){
            $state.go('app.manage_institution.members', {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToManageInstitutions = function goToManageInstitutions(instKey){
            $state.go('app.manage_institution.invite_inst', {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToEditInstInfo = function goToEditInstInfo(instKey){
            $state.go('app.manage_institution.edit_info', {
                institutionKey: instKey || mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToReport = function goToReport() {
            $window.open(url_report);
        };


        mainCtrl.openConfigMenu = function openConfigMenu(ev) {
            $mdMenu.open(ev);
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
            $state.reload();
            $window.location.reload();
        };

        /** Function used in bottom navbar to redirect to new state and
         * reset properties of CSS that can be modified while using in mode mobile
         * @param {string} state - state that should be redirect. 
         */
        mainCtrl.goToOfBottomNav = function goToOfBottomNav(state) {
            mainCtrl.stateView = "app.user." + state;
            resetNavBarDisplayStyle();
            $state.go(mainCtrl.stateView);
        };

        /** Update the state view to notifications
         *  and reset properties of CSS.
         */
        mainCtrl.selectNotificationState = function selectNotificationState(){
            mainCtrl.stateView = "app.user.notifications";
            resetNavBarDisplayStyle();
        }

        /** Return correct class according currently state view.
         */
        mainCtrl.getSelectedStateClass = function getSelectedStateClass(state){
            state = "app.user." + state;
            return (state === mainCtrl.stateView) ? "color-icon-selected-navbar":"color-icon-navbar";
        };

        /** Reset properties CSS. 
         * In mode mobile maybe changes some properties.
         */
        function resetNavBarDisplayStyle(){
            document.getElementById('main-toolbar').style.display = 'block';
        }

        /** Add new observers to listen events that user should be refresh. 
         */ 
        function notificationListener() {
            NotificationListenerService.multipleEventsListener(UserService.NOTIFICATIONS_TO_UPDATE_USER,
                mainCtrl.refreshUser);
        }

        (function main() {
            if (mainCtrl.user.name === 'Unknown') {
                $state.go("app.user.config_profile");
            }
            notificationListener();
            mainCtrl.getPendingTasks();
        })();
    });
})();
