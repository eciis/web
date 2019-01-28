"use strict";

(describe("UserProfileInfoComponent", () => {

    let componentController, rootScope, 
     scope, userProfileInfoCtrl;

    const user_profile = {
        office: "Employee",
        phone: "99999-9999",
        email: "test@test.com"
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, $rootScope) => {

        componentController = $componentController;
        rootScope = $rootScope;
        scope = rootScope.$new();

        userProfileInfoCtrl = componentController("userProfileInfo", scope,
            {office: user_profile.office, phone: user_profile.phone, email: user_profile.email});
    }));

    describe("Test functions", () => {

        describe("showProperty()", () => {
            it('Should return "Não informado" if has nothing in property', () => {
                expect(userProfileInfoCtrl.showProperty(undefined)).toEqual("Não informado");
            });

            it('Should return limited string according by number of second parameter', () => {
                expect(userProfileInfoCtrl.showProperty(user_profile.email, 4)).toEqual("test@...");
            });
        });
    });
}));