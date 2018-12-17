"use strict";

(fdescribe("SideMenuComponent tests", () => {

    let componentController, authService, states, state, rootScope,
        homeItemsFactory, manageInstItemsFactory, institutionService,
        sideMenuCtrl, scope, deferred, institution, user, item;

    const HOME_TYPE = "HOME";
    const MANAG_INST_TYPE = "MANAGE_INSTITUTION";

    const setupModels = () => {
        institution = new Institution({
            name: 'institution',
            key: 'inst-key',
            id: 'inst-key',
            photo_url: 'inst-img'
        });
    
        user = new User({
            name: 'User',
            key: 'user-key',
            current_institution: {key: institution.key},
            state: 'active',
            photo_url: 'user-img',
            institution_profiles: [
                {
                    institution_key:  institution.key,
                    color: 'pink'
                }
            ]
        });
    
        item = {
            icon: 'some icon',
            description: 'some description',
            stateName: 'some state',
            onClick: () => {}
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, AuthService, STATES, $state, $mdDialog, 
        HomeItemsFactory, ManageInstItemsFactory, InstitutionService, $rootScope, $q) => {

        componentController = $componentController;
        authService = AuthService;
        states = STATES;
        state = $state;
        mdDialog = $mdDialog;
        homeItemsFactory = HomeItemsFactory;
        manageInstItemsFactory = ManageInstItemsFactory;
        institutionService = InstitutionService;
        rootScope = $rootScope;
        deferred = $q.defer();

        setupModels();

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

        describe('getProfileColor()', () => {
            it('should return the pink color with intensity 100', () => {
                expect(sideMenuCtrl.getProfileColor(100)).toBe('pink-100');
            });

            it('should return the default color with intensity 500', () => {
                user.current_institution.key = 'other-inst-key';
                expect(sideMenuCtrl.getProfileColor(500)).toBe('teal-500');
            });
        });

        describe('getImage()', () => {
            it(`should return the institution default image when the component 
                type is not HOME and the entity is not defined`, () => {
                const instAvatar = '/app/images/institution.png';
                sideMenuCtrl.type = MANAG_INST_TYPE;
                sideMenuCtrl.entity = undefined;
                expect(sideMenuCtrl.getImage()).toBe(instAvatar);
            });

            it(`should return the user default image when the component 
                type is HOME and the entity is not defined`, () => {
                const userAvatar = '/app/images/avatar.png';
                sideMenuCtrl.type = HOME_TYPE;
                sideMenuCtrl.entity = undefined;
                expect(sideMenuCtrl.getImage()).toBe(userAvatar);
            });

            it('should return the user image', () => {
                sideMenuCtrl.entity = user;
                expect(sideMenuCtrl.getImage()).toBe(user.photo_url);
            });

            it('should return the institution image', () => {
                sideMenuCtrl.entity = institution;
                expect(sideMenuCtrl.getImage()).toBe(institution.photo_url);
            });
        });

        describe('getTitle()', () => {
            it('should return the user name when it is the user', () => {
                sideMenuCtrl.entity = user;
                expect(sideMenuCtrl.getTitle()).toBe(user.name);
            });

            it('should return the institution name when it is the institution', () => {
                sideMenuCtrl.entity = institution;
                expect(sideMenuCtrl.getTitle()).toBe(institution.name);
            });

            it('should return an empty string when the entity is no defined', () => {
                sideMenuCtrl.entity = undefined;
                expect(sideMenuCtrl.getTitle()).toBe('');
            });
        });

        describe('onClickTitle()', () => {
            beforeEach(() => {
                spyOn(state, 'go');
                sideMenuCtrl.entity = institution;
            });

            it(`should go to instituton timeline state
                when the type is MANAG_INST_TYPE`, () => {
                sideMenuCtrl.type = MANAG_INST_TYPE;
                sideMenuCtrl.onClickTitle();
                expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, {institutionKey: institution.key});
            });

            it(`should not go to instituton timeline state
                when the type is not MANAG_INST_TYPE`, () => {
                sideMenuCtrl.type = HOME_TYPE;
                sideMenuCtrl.onClickTitle();
                expect(state.go).not.toHaveBeenCalled();
            });
        });

        describe('onClickImage()', () => {
            beforeEach(() => {
                spyOn(state, 'go');
                sideMenuCtrl.entity = institution;
            });

            it(`should go to instituton timeline state
                when the type is MANAG_INST_TYPE`, () => {
                sideMenuCtrl.type = MANAG_INST_TYPE;
                sideMenuCtrl.onClickImage();
                expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, {institutionKey: institution.key});
            });

            it(`should not go to instituton timeline state
                when the type is not MANAG_INST_TYPE`, () => {
                sideMenuCtrl.type = HOME_TYPE;
                sideMenuCtrl.onClickImage();
                expect(state.go).not.toHaveBeenCalled();
            });
        });

        describe('getSelectedClass', () => {
            it(`should return the selected state when the
                selected item matchs the current state`, () => {
                state.current.name = states.HOME;
                expect(sideMenuCtrl.getSelectedClass("HOME")).toBe("selected");
            });

            it(`should return an empty string when the
                the current item does not match the current state`, () => {
                state.current.name = states.HOME;
                expect(sideMenuCtrl.getSelectedClass("MANAGE_INST")).toBe("");
            });
        });

        describe('show()', () => {
            it('should call the showIf function when it is defined', () => {
                const item = {showIf: () => true};
                spyOn(item, 'showIf');
                sideMenuCtrl.show(item);
                expect(item.showIf).toHaveBeenCalled();
            });

            it('should return true when the showIf function is not defined', () => {
                const item = {showIf: undefined};
                expect(sideMenuCtrl.show(item)).toBe(true);
            });
        });

        describe('changeInstitution()', () => {
            it(`should call the user's changeInstitution function`, () => {
                const profile = {institution_key: 'some-inst-key'};
                spyOn(sideMenuCtrl.user, 'changeInstitution');
                sideMenuCtrl.changeInstitution(profile);
                expect(sideMenuCtrl.user.changeInstitution).toHaveBeenCalledWith({'key': profile.institution_key});
            });
        });

        describe('isType()', () => {
            it(`should be true when the type passed matchs the component type`, () => {
                sideMenuCtrl.type = HOME_TYPE;
                expect(sideMenuCtrl.isType(HOME_TYPE)).toBe(true);
            });

            it(`should be false when the type passed
                does not matchs the component type`, () => {
                sideMenuCtrl.type = HOME_TYPE;
                expect(sideMenuCtrl.isType(MANAG_INST_TYPE)).toBe(false);
            });
        });
    });
}));