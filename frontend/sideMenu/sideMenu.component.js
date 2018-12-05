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
            onClickImage: '<',
            onClickTitle: '<'
        }
    });

    function sideMenuController(AuthService, STATES, $state, $mdSidenav) {
        const sideMenuCtrl = this;

        sideMenuCtrl.user = AuthService.getCurrentUser();
        const isUser = sideMenuCtrl.entity instanceof User;


        sideMenuCtrl.$onInit = () => {

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
            const defaultImage = isUser ? userAvatar : instAvatar;
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.photo_url : defaultImage;
        };

        sideMenuCtrl.getTitle = () => {
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.name : "";
        };

        sideMenuCtrl.getSelectedClass = stateName => {
            return $state.current.name === STATES[stateName] ? "selected" : "";
        };

        sideMenuCtrl.show = item => {
            return item.showIf ? item.showIf() : true; 
        }
    }
})();