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

        /**
         * Store (internally) colorPicker's active state,
         * allowing a single dynamic view for both mobile and desktop.
         * When it's on: avatar is replaced with that institution's color;
         * clicking on a institution changes that to current;
         * last button on menu shows "Voltar" and toggles this variable;
         * When it's off: institution's avatar is shown;
         * clicking on a institution shows a dialog to pick a new color for that;
         * last button on menu shows "Gerenciar cores".
         */
        sideMenuCtrl._isColorPickerActive = false;

        /**
         * Toggle colorPicker's active state.
         */
        sideMenuCtrl.toggleColorPicker = () => {
          sideMenuCtrl._isColorPickerActive = !sideMenuCtrl._isColorPickerActive;
        }

        /**
         * Gets user's current_institution profile.
         * Needed to provide a default profile to #openColorPicker (desktop behavior).
         */
        sideMenuCtrl.getCurrentInstitutionProfile = () => {
          return _.find(sideMenuCtrl.user.institution_profiles, ['institution_key', sideMenuCtrl.user.current_institution.key]);
        }

        /**
         * Calls the correct function based on if it's a mobile screen,
         * and current colorPicker's active state.
         * The color picker dialog should only open here when on mobile
         * AND the color picker is active.
         * Otherwise, that should be made the current institution on the user.
         *
         * @param {Object} profile - institution profile to be made current or have its color changed
         */
        sideMenuCtrl.institutionButtonAction = (profile) => {
          sideMenuCtrl.isMobileScreen && sideMenuCtrl.isColorPickerActive ?
            sideMenuCtrl.openColorPicker(profile) :
            sideMenuCtrl.changeInstitution(profile);
        }

        /**
         * Defines a property .currentMenuOption,
         * returning the current button based on colorPicker's active state.
         */
        Object.defineProperty(sideMenuCtrl, 'currentMenuOption', {
          get: function() {
            return sideMenuCtrl.isColorPickerActive ? backButton : colorPickerButton;
          }
        })

        /**
         * Defines a property .isColorPickerActive,
         * that always return true on desktop.
         * On mobile, maps to internal _isColorPickerActive variable.
         */
        Object.defineProperty(sideMenuCtrl, 'isColorPickerActive', {
          get: function() {
            return sideMenuCtrl.isMobileScreen ? sideMenuCtrl._isColorPickerActive : true;
          }
        });

        /**
         * Defines a property .isMobileScreen,
         * shorthand for Utils.isMobileScreen().
         * Needed by the view to provide adequate buttons on desktop and mobile.
         */
        Object.defineProperty(sideMenuCtrl, 'isMobileScreen', {
          get: function() {
            return Utils.isMobileScreen();
          },
        });

        sideMenuCtrl.openColorPicker = (institution = sideMenuCtrl.getCurrentInstitutionProfile()) => {
            $mdDialog.show({
               controller: "ColorPickerController",
               controllerAs: "colorPickerCtrl",
               templateUrl: Utils.selectFieldBasedOnScreenSize('app/home/color_picker.html',
                'app/home/color_picker_mobile.html'),
               parent: angular.element(document.body),
               clickOutsideToClose: true,
               locals: {
                   user : sideMenuCtrl.user,
                   institution,
                },
               bindToController: true,
               onComplete: function() { sideMenuCtrl._isColorPickerActive = false },
           });
       };
    }
})();