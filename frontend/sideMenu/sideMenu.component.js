'use strict';

(function() {
    angular
    .module('app')
    .component('sideMenu', {
        templateUrl: "app/sideMenu/sideMenu.html",
        controller: sideMenuController,
        controllerAs: "sideMenuCtrl",
        bindings: {
            items: '<',
            entity: '<',
            isInstitution: '<',
            onClickImage: '<',
            onClickTitle: '<'
        }
    });

    function sideMenuController(AuthService, STATES, $state, $mdSidenav) {
        const sideMenuCtrl = this;

        sideMenuCtrl.user = AuthService.getCurrentUser();


        sideMenuCtrl.$onInit = () => {
            loadEntity();
        };

        const loadEntity = () => {
            if(!sideMenuCtrl.isInstitution) {
                sideMenuCtrl.entity = sideMenuCtrl.user;
            }
        };
        
        sideMenuCtrl.close = () => {
            $mdSidenav('sideMenu').close();
        };

        sideMenuCtrl.getProfileColor = intensity => {
            return `${sideMenuCtrl.user.getProfileColor()}-${intensity}`;
        }; 

        sideMenuCtrl.getImage = () => {
            const instAvatar = '/app/images/institution.png';
            const userAvatar = '/app/images/avatar.png';
            const defaultImage = sideMenuCtrl.isInstitution ? instAvatar : userAvatar;
            return _.get(sideMenuCtrl, 'entity.photo_url', defaultImage);
        };

        sideMenuCtrl.getTitle = () => {
            return _.get(sideMenuCtrl, 'entity.name', "");
        };

        sideMenuCtrl.getSelectedClass = stateName => {
            return $state.current.name === STATES[stateName] ? "selected" : "";
        };
    }
})();