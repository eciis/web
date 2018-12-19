'use strict';

(function() {
    angular
    .module('app')
    .component('sideMenu', {
        templateUrl: "app/sideMenu/side_menu.html",
        controller: sideMenuController,
        controllerAs: "sideMenuCtrl",
        bindings: {
            type: '@'
        }
    });

    function sideMenuController(AuthService, STATES, $state, $mdSidenav, 
        $mdDialog, HomeItemsFactory, ManageInstItemsFactory, InstitutionService, SideMenuTypes) {
        
        const sideMenuCtrl = this;

        sideMenuCtrl.user = AuthService.getCurrentUser();
        
        sideMenuCtrl.$postLink = () => {
            setup();
        };
        
        const setup = () => {
            switch(sideMenuCtrl.type) {
                case SideMenuTypes.HOME: setupHomeMenu(); break;
                default: setupIntitutionMenu();
            }
        };
        
        const setupHomeMenu = () => {
            sideMenuCtrl.entity = sideMenuCtrl.user;
            setItems();
        };
        
        const setupIntitutionMenu = () => {
            InstitutionService.getInstitution($state.params.institutionKey)
            .then(inst => {
                sideMenuCtrl.entity = new Institution(inst);
                setItems();
            });
        };

        const setItems = () => {
            sideMenuCtrl.items = getFactory().getItems(sideMenuCtrl.entity);
        };
        
        const getFactory = () => {
            switch(sideMenuCtrl.type){
                case SideMenuTypes.HOME: return HomeItemsFactory;
                case SideMenuTypes.MANAG_INSTITUTION: return ManageInstItemsFactory;
            }
        };

        sideMenuCtrl.getProfileColor = intensity => {
            return `${sideMenuCtrl.user.getProfileColor()}-${intensity}`;
        }; 

        sideMenuCtrl.getImage = () => {
            const instAvatar = '/app/images/institution.png';
            const userAvatar = '/app/images/avatar.png';
            const defaultImage = sideMenuCtrl.isType(SideMenuTypes.HOME) ? userAvatar : instAvatar;
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.photo_url : defaultImage;
        };

        sideMenuCtrl.getTitle = () => {
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.name : "";
        };

        sideMenuCtrl.onClickTitle = () => {
            if(sideMenuCtrl.isType(SideMenuTypes.MANAG_INSTITUTION)) goToInstitution();
        };

        sideMenuCtrl.onClickImage = () => {
            if(sideMenuCtrl.isType(SideMenuTypes.MANAG_INSTITUTION)) goToInstitution();
        };

        const goToInstitution = () => {
            $state.go(STATES.INST_TIMELINE, {institutionKey: sideMenuCtrl.entity.key});
        };

        sideMenuCtrl.changeInstitution = profile => {
            sideMenuCtrl.user.changeInstitution({'key': profile.institution_key});
        };

        sideMenuCtrl.isType = type => {
            return type === sideMenuCtrl.type;
        };

        sideMenuCtrl.openColorPicker = () => {
            $mdDialog.show({
               controller: "ColorPickerController",
               controllerAs: "colorPickerCtrl",
               templateUrl: 'app/home/color_picker.html',
               parent: angular.element(document.body),
               clickOutsideToClose: true,
               locals: {
                   user : sideMenuCtrl.user
                },
                bindToController: true
           });
       };
    }
})();