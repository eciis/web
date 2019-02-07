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

    function sideMenuController(AuthService, STATES, $state, $mdDialog, MessageService,
        HomeItemsFactory, ManageInstItemsFactory, InstitutionService, SIDE_MENU_TYPES) {
        
        const sideMenuCtrl = this;
        const colorPickerButton = {
          text: 'Gerenciar cores',
          icon: 'color_lens',
        };
        const backButton = {
          text: 'Voltar',
          icon: 'keyboard_arrow_left',
        };

        sideMenuCtrl.user = AuthService.getCurrentUser();
        
        sideMenuCtrl.$postLink = () => {
            setup();
        };
        
        const setup = () => {
            switch(sideMenuCtrl.type) {
                case SIDE_MENU_TYPES.HOME: setupHomeMenu(); break;
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
            })
            .catch(err => {
                MessageService.showToast("Um erro ocorreu. Não foi possível carregar a instituição.");
            });
        };

        const setItems = () => {
            sideMenuCtrl.items = getFactory().getItems(sideMenuCtrl.entity);
        };
        
        const getFactory = () => {
            switch(sideMenuCtrl.type){
                case SIDE_MENU_TYPES.HOME: return HomeItemsFactory;
                case SIDE_MENU_TYPES.MANAG_INSTITUTION: return ManageInstItemsFactory;
            }
        };

        sideMenuCtrl.getProfileColor = intensity => {
            return `${sideMenuCtrl.user.getProfileColor()}-${intensity}`;
        }; 

        sideMenuCtrl.getImage = () => {
            const instAvatar = '/app/images/institution.png';
            const userAvatar = '/app/images/avatar.png';
            const defaultImage = sideMenuCtrl.isType(SIDE_MENU_TYPES.HOME) ? userAvatar : instAvatar;
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.photo_url : defaultImage;
        };

        sideMenuCtrl.getTitle = () => {
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.name : "";
        };

        sideMenuCtrl.onClickTitle = () => {
            if(sideMenuCtrl.isType(SIDE_MENU_TYPES.MANAG_INSTITUTION)) goToInstitution();
        };

        sideMenuCtrl.onClickImage = () => {
            if(sideMenuCtrl.isType(SIDE_MENU_TYPES.MANAG_INSTITUTION)) goToInstitution();
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

        sideMenuCtrl.isColorPickerActive = false;

        sideMenuCtrl.toggleColorPicker = () => {
          sideMenuCtrl.isColorPickerActive = !sideMenuCtrl.isColorPickerActive;
        }

        Object.defineProperty(sideMenuCtrl, 'currentMenuOption', {
          get: function() {
            return sideMenuCtrl.isColorPickerActive ? backButton : colorPickerButton;
          }
        })

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