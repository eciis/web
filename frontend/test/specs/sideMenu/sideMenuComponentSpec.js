"use strict";

(fdescribe("SideMenuComponent tests", () => {

    let componentController, authService, states, state, mdSidenav, rootScope, 
    mdDialog, homeItemsFactory, manageInstItemsFactory, institutionService;

    let sideMenuCtrl, scope, deferred;

    const HOME_TYPE = "HOME";
    const MANAG_INST_TYPE = "MANAGE_INSTITUTION";
    const INST_PAGE_TYPE = "INSTITUTION_PAGE";

    const institution = new Institution({
        name: 'institution',
        key: 'inst-key',
        id: 'inst-key'
    });

    const user = new User({
        name: 'User',
        key: 'user-key',
        current_institution: {key: 'current-inst-key'},
        state: 'active',
        institution_profiles: [
            {
                institution_key:  institution.key,
                color: 'pink'
            }
        ]
    });

    const item = {
        icon: 'some icon',
        description: 'some description',
        stateName: 'some state',
        onClick: () => {}
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, AuthService, STATES, $state, $mdSidenav,
        $mdDialog, HomeItemsFactory, ManageInstItemsFactory, InstitutionService, $rootScope, $q) => {

        componentController = $componentController;
        authService = AuthService;
        states = STATES;
        state = $state;
        mdDialog = $mdDialog;
        mdSidenav = $mdSidenav;
        homeItemsFactory = HomeItemsFactory;
        manageInstItemsFactory = ManageInstItemsFactory;
        institutionService = InstitutionService;
        rootScope = $rootScope;
        deferred = $q.defer();

        scope = rootScope.$new();
        authService.login(user);
        sideMenuCtrl = componentController("sideMenu", scope, {type: HOME_TYPE});
    }));

    describe("Tests", () => {

        describe('postLink()', () => {
            beforeEach(() => {
                expect(sideMenuCtrl.entity).toBe(undefined);
                expect(sideMenuCtrl.items).toBe(undefined);
            })

            it('should set entity to be user when the type is HOME', () => {
                spyOn(homeItemsFactory, 'getItems').and.returnValue([item]);
                sideMenuCtrl.$postLink();
                expect(sideMenuCtrl.entity).toBe(authService.getCurrentUser());
                expect(homeItemsFactory.getItems).toHaveBeenCalledWith(sideMenuCtrl.entity);
                expect(sideMenuCtrl.items).toEqual([item]);
            });

            it('should set entity to be institution when the type is MANAGE_INSTITUTION', () => {
                sideMenuCtrl.type = MANAG_INST_TYPE;
                spyOn(institutionService, 'getInstitution').and.returnValue(deferred.promise);
                spyOn(manageInstItemsFactory, 'getItems').and.returnValue([item]);
                deferred.resolve(institution);
                sideMenuCtrl.$postLink();
                scope.$apply();
                expect(sideMenuCtrl.entity).toEqual(new Institution(institution));
                expect(manageInstItemsFactory.getItems).toHaveBeenCalledWith(sideMenuCtrl.entity);
                expect(sideMenuCtrl.items).toEqual([item]);
            });
        });

        xdescribe("close()", () => {
            it('should call the sidenav close function', () => {
                const sideNav = document.createElement("SideNav");
                sideNav.setAttribute("md-component-id", "sideMenu");
                spyOn(mdSidenav("sideMenu"), "close").and.callThrough();
                sideMenuCtrl.close();
                expect(mdSidenav("sideMenu").close()).toHaveBeenCalled();
            });
        });

        describe('getProfileColor()', () => {
            it('should return the color with intensity', () => {
                expect(sideMenuCtrl.getProfileColor(100)).toBe('pink-100');
            });
        });
    });
}));