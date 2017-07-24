'use strict';
(function() {
    var app = angular.module('app');

    app.controller('PanelMenuCtrl', PanelMenuCtrl);

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state,
            AuthService, $rootScope, InstitutionService, $mdPanel, $q) {
        var mainCtrl = this;

        mainCtrl.search = "";
        mainCtrl.user = AuthService.getCurrentUser();
        mainCtrl.showSearchMenu = false;
        mainCtrl.institutions = [];
        mainCtrl._mdPanel = $mdPanel;

        mainCtrl.showMenu = function showMenu(ev) {
            var deferred = $q.defer();
            if(mainCtrl.search) {
                mainCtrl.finalSearch = mainCtrl.search;
                mainCtrl.makeSearch().then(function success() {
                    mainCtrl.openMenu(ev, deferred);
                });
            }
            return deferred.promise;
        };

        mainCtrl.openMenu = function openMenu(ev, deferred){
            mainCtrl.search = '';
            var position = mainCtrl._mdPanel.newPanelPosition()
                    .relativeTo('.demo-menu-open-button')
                    .addPanelPosition(mainCtrl._mdPanel.xPosition.ALIGN_START, mainCtrl._mdPanel.yPosition.BELOW);

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
            deferred.resolve(mainCtrl.institutions);
            mainCtrl._mdPanel.open(config);
        };




        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.makeSearch = function () {
            var deferred = $q.defer();
            InstitutionService.searchInstitutions(mainCtrl.finalSearch).then(function success(response) {
                mainCtrl.institutions = response.data;
                deferred.resolve(response);
                if(_.size(mainCtrl.institutions) === 0){
                    mainCtrl.institutions.push({name: 'Nenhuma instituição encontrada'});
                }
            });
            return deferred.promise;
        };

        mainCtrl.isActive = function isActive(inst) {
            if (mainCtrl.user.current_institution == inst) {
                return true;
            }
            return false;
        };

        mainCtrl.isAdmin = function isAdmin() {
            if (mainCtrl.user){
                return !_.isEmpty(mainCtrl.user.institutions_admin);
            }
        };

        mainCtrl.changeInstitution = function changeInstitution(name) {
            mainCtrl.user.changeInstitution(name);
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

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        (function main() {
            if (mainCtrl.user.institutions.length === 0 &&
              mainCtrl.user.invites.length === 0) {
                $state.go("user_inactive");
            }

            var invite = mainCtrl.user.getPendingInvitationOf("user");
            if (mainCtrl.user.institutions.length > 0 && invite) {
                var institutionKey = invite.institution_key;
                var inviteKey = invite.key;
                $state.go("new_invite", {institutionKey: institutionKey, inviteKey: inviteKey});
            }

            if (mainCtrl.user.getPendingInvitationOf("institution")) {
                $state.go("submit_institution");
            }
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
            if(institutionId) {
                InstitutionService.getInstitution(institutionId).then(function success(response) {
                    $state.go('app.institution', {institutionKey: response.data.key});
                });
            }
            panelCtrl.closePanel();
        };

        panelCtrl.closePanel = function closePanel(){
            panelCtrl._mdPanelRef.close();
        };
    }
})();