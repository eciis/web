'use strict';

(function() {
    angular
    .module('app')
    .component('sideMenu', {
        templateUrl: "app/sideMenu/sideMenu.html",
        controller: sideMenuController,
        controllerAs: "sideMenuCtrl",
        bindings: {
            type: '@'
        }
    });

    function sideMenuController(AuthService, STATES, $state, $mdSidenav, 
        $mdDialog, HomeItemsFactory, ManageInstItemsFactory, InstitutionService) {
        
        const sideMenuCtrl = this;
        const HOME_TYPE = "HOME";
        const MANAG_INST_TYPE = "MANAGE_INSTITUTION";
        const INST_PAGE_TYPE = "INSTITUTION_PAGE";

        sideMenuCtrl.user = AuthService.getCurrentUser();
        
        sideMenuCtrl.$postLink = () => {
            setup();
        };
        
        const setup = () => {
            if(sideMenuCtrl.isType(HOME_TYPE)) {
                sideMenuCtrl.entity = sideMenuCtrl.user;
                loadItems();
            } else {
                const instKey = $state.params.institutionKey;
                InstitutionService.getInstitution(instKey)
                .then(inst => {
                    sideMenuCtrl.entity = new Institution(inst);
                    loadItems();
                }).catch(err => console.error(err));
            }
        };

        const loadItems = () => {
            switch(sideMenuCtrl.type){
                case HOME_TYPE: 
                    sideMenuCtrl.items = HomeItemsFactory.getItems(sideMenuCtrl.entity);
                    break;
                case MANAG_INST_TYPE:
                    sideMenuCtrl.items = ManageInstItemsFactory.getItems(sideMenuCtrl.entity);
                    break;
                case INST_PAGE_TYPE:
                    break;
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
            const defaultImage = sideMenuCtrl.isType(HOME_TYPE) ? userAvatar : instAvatar;
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.photo_url : defaultImage;
        };

        sideMenuCtrl.getTitle = () => {
            return sideMenuCtrl.entity ? sideMenuCtrl.entity.name : "";
        };

        sideMenuCtrl.onClickTitle = () => {
            if(sideMenuCtrl.isType(MANAG_INST_TYPE)) goToInstitution();
        };

        sideMenuCtrl.onClickImage = () => {
            if(sideMenuCtrl.isType(MANAG_INST_TYPE)) goToInstitution();
        };

        const goToInstitution = () => {
            $state.go(STATES.INST_TIMELINE, {institutionKey: sideMenuCtrl.entity.key});
        };

        sideMenuCtrl.getSelectedClass = stateName => {
            return $state.current.name === STATES[stateName] ? "selected" : "";
        };

        sideMenuCtrl.show = item => {
            return item.showIf ? item.showIf() : true; 
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