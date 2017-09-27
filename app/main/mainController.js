'use strict';
(function() {
    var app = angular.module('app');

    app.controller('PanelMenuCtrl', PanelMenuCtrl);

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state,
            AuthService, $rootScope, InstitutionService, $mdPanel, $q, RequestInvitationService,
            InviteService, $mdMenu) {
        var mainCtrl = this;

        mainCtrl.search = "";
        mainCtrl.user = AuthService.getCurrentUser();
        mainCtrl.showSearchMenu = false;
        mainCtrl.institutions = [];
        mainCtrl._mdPanel = $mdPanel;
        var NO_INSTITUTION = 'Nenhuma instituição encontrada';

        mainCtrl.pending_manager_member = 0;
        mainCtrl.pending_inst_invitations = 0;

        mainCtrl.showMenu = function showMenu(ev) {
            var deferred = $q.defer();
            if(mainCtrl.search) {
                mainCtrl.finalSearch = mainCtrl.search;
                mainCtrl.makeSearch().then(function success() {
                    mainCtrl.openMenu(ev);
                    deferred.resolve(mainCtrl.institutions);
                });
            }
            return deferred.promise;
        };

        mainCtrl.openMenu = function openMenu(ev){
            mainCtrl.search = '';
            var position = mainCtrl._mdPanel.newPanelPosition()
                    .relativeTo('.demo-menu-open-button')
                    .addPanelPosition(mainCtrl._mdPanel.xPosition.ALIGN_START,
                        mainCtrl._mdPanel.yPosition.BELOW);

            var config = {
                attachTo: angular.element(document.body),
                controller: PanelMenuCtrl,
                controllerAs: 'PanelCtrl',
                templateUrl: 'search_panel.html',
                panelClass: 'demo-menu-example',
                position: position,
                locals: {
                    'institutions': mainCtrl.institutions
                },
                openFrom: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                zIndex: 2
            };
            mainCtrl._mdPanel.open(config);
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.makeSearch = function () {
            var deferred = $q.defer();
            InstitutionService.searchInstitutions(mainCtrl.finalSearch, "active").then(function success(response) {
                mainCtrl.institutions = response.data;
                if(_.isEmpty(mainCtrl.institutions)){
                    mainCtrl.institutions.push({name: NO_INSTITUTION});
                }
                deferred.resolve(response);
            });
            return deferred.promise;
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
            return mainCtrl.user.permissions.analyze_request_inst;
        };

        mainCtrl.changeInstitution = function changeInstitution(institution) {
            mainCtrl.user.changeInstitution(institution);
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
            $state.go('app.invite_inst');
        };

        mainCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
            mainCtrl.toggle();
        };

        mainCtrl.goEvents = function goEvents(){
            $state.go('app.events');
        };

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        mainCtrl.goToManageMembers = function goToManageMembers(){
            $state.go('app.manage_institution.invite_user', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToManageInstitutions = function goToManageInstitutions(){
            $state.go('app.manage_institution.invite_inst', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToEditInfo = function goToEditInfo(){
            $state.go('app.manage_institution.edit_info', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.openConfigMenu = function openConfigMenu(ev) {
            $mdMenu.open(ev);
        };

        function increaseInstInvitationsNumber(response) {
            mainCtrl.pending_inst_invitations += response.data.length;
        }

        mainCtrl.getPendingTasks = function getPendingTasks() {
            mainCtrl.pending_manager_member = 0;
            mainCtrl.pending_inst_invitations = 0;

            RequestInvitationService.getRequests(mainCtrl.user.current_institution.key).then(
                function success(response) {
                    mainCtrl.pending_manager_member = response.data.length;
                }, function error() {}
            );
            RequestInvitationService.getParentRequests(mainCtrl.user.current_institution.key).then(
                increaseInstInvitationsNumber, function error() {}
            );
            RequestInvitationService.getChildrenRequests(mainCtrl.user.current_institution.key).then(
                increaseInstInvitationsNumber, function error() {}
            );
        };

        (function main() {
            if (mainCtrl.user.name === 'Unknown') {
                $state.go("app.config_profile");
            }

            mainCtrl.getPendingTasks();
        })();
    });

    function PanelMenuCtrl (mdPanelRef, InstitutionService, $state, $timeout) {
        var panelCtrl = this;
        panelCtrl._mdPanelRef = mdPanelRef;

        $timeout(function() {
            var selected = document.querySelector('.demo-menu-item.selected');
            if (selected) {
              angular.element(selected).focus();
            } else {
              angular.element(document.querySelectorAll('.demo-menu-item')[0]).focus();
            }
        });

        panelCtrl.goToSearchedInstitution = function goToSearchedInstitution(institutionId) {
            panelCtrl.goToInstitution(institutionId);
            panelCtrl.closePanel();
        };

        panelCtrl.goToInstitution = function goToInstitution(institutionId) {
            if(institutionId) {
                InstitutionService.getInstitution(institutionId).then(function success(response) {
                    $state.go('app.institution', {institutionKey: response.data.key});
                });
            }
        } ;

        panelCtrl.closePanel = function closePanel(){
            panelCtrl._mdPanelRef.close();
        };
    }
})();