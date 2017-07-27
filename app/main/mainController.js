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
                console.log(mainCtrl.institutions);
                if(_.size(mainCtrl.institutions) === 0){
                    mainCtrl.institutions.push({name: 'Nenhuma instituição encontrada'});
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

        mainCtrl.isAdmin = function isAdmin(current_institution) {
            if (mainCtrl.user && mainCtrl.user.isAdmin(current_institution)){
                return true;
            }
            return false;
        };

        mainCtrl.userIsActive = function userIsActive() {
            return mainCtrl.user.state == 'active';
        };

        mainCtrl.changeInstitution = function changeInstitution(institution) {
            mainCtrl.user.changeInstitution(institution);
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

        function isInactive() {
            var notMember = mainCtrl.user.institutions.length === 0;
            var notInvitee = mainCtrl.user.invites.length === 0;
            var notActive = !mainCtrl.userIsActive();

            return ((notMember && notInvitee) || notActive);
        }

        (function main() {
            var inviteOfUser = mainCtrl.user.getPendingInvitationOf("user");
            var inviteOfInstitution = mainCtrl.user.getPendingInvitationOf("institution");
           
            if (inviteOfUser) {
                var institutionKey = inviteOfUser.institution_key;
                var inviteKey = inviteOfUser.key;
                $state.go("new_invite", {institutionKey: institutionKey, inviteKey: inviteKey});
            } else if (inviteOfInstitution) {
                var institutionStubKey = inviteOfInstitution.stub_institution_key;
                $state.go("submit_institution", {institutionKey: institutionStubKey});
            } else if (isInactive()) {
                $state.go("user_inactive");
            } else if (mainCtrl.user.name === 'Unknown') {
                $state.go("config_profile");
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