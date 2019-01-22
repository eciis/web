"use strict";

(describe("ListUsersComponent", () => {

    let componentController, authService, rootScope, profileService,
     scope, institution, user, users, listUsersCtrl;

    const setupModels = () => {
        institution = new Institution({
            name: 'institution',
            key: 'inst-key',
            id: 'inst-key',
            photo_url: 'inst-img'
        });
    
        user = new User({
            name: 'User Test',
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

        users = [user];
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, AuthService, 
        ProfileService, $rootScope) => {

        componentController = $componentController;
        authService = AuthService;
        profileService = ProfileService;
        rootScope = $rootScope;

        setupModels();

        scope = rootScope.$new();
        authService.login(user);
        listUsersCtrl = componentController("listUsers", scope,
            {pageLabel: "Users List", users: users});
    }));

    describe("Tests functions", () => {

        describe("getInitialLetterOfName()", () => {
            it('Should call Utils.getInitialLetterOfName', () => {
                spyOn(Utils, 'getInitialLetterOfName');
                listUsersCtrl.getInitialLetterOfName(user);
                expect(Utils.getInitialLetterOfName).toHaveBeenCalled();
            });

            it('Should return first letter of name "User"', () => {
                expect(listUsersCtrl.getInitialLetterOfName(user)).toEqual("U");
            });
        });

        describe("showUserProfile()", () => {
            it('Should call profileService.showProfile', () => {
                spyOn(profileService, 'showProfile').and.callFake(() => {
                    return {
                      then: (callback) => {
                        return callback({});
                      }
                    };
                });
                listUsersCtrl.showUserProfile(user.key, "$event");
                expect(profileService.showProfile).toHaveBeenCalledWith(user.key, "$event");
            });
        });
    });
}));