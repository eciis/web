"use strict";

(describe("EventCardComponent", () => {

    let componentController, authService, rootScope,
     scope, institution, user, event, eventCardCtrl;

    institution = {
        key: 'inst-key',
    };

    user = {
        institution_profiles: [
            {
                institution_key:  institution.key,
                color: 'pink'
            }
        ]
    };

    event = {
        'institution_key': institution.key,
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, AuthService, $rootScope) => {

        componentController = $componentController;
        authService = AuthService;
        rootScope = $rootScope;
        scope = rootScope.$new();
        authService.login(user);
        eventCardCtrl = componentController("eventCard", scope,
            {event: event, user: user});
        eventCardCtrl.user = user;
        eventCardCtrl.event = event;
    }));

    describe('getProfileColor()', () => {

        it('Should return the color if user is member of institution of event', () => {
            expect(eventCardCtrl.getProfileColor()).toEqual(_.first(user.institution_profiles).color);
        });

        it('Should return a default color "teal" if user is not a member of institution of event', () => {
            eventCardCtrl.user = {institution_profiles: []};
            expect(eventCardCtrl.getProfileColor()).toEqual('teal');
        });
    });
}));