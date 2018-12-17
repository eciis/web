'use strict';

describe('registeredInstitutionController test', () => {
    beforeEach(module('app'));

    let instService, msgService, statesConst, state, regInstCtrl, authService;

    const user = new User({
        follows: [],
        institutions: []
    });

    const institution = new Institution({
        key: 'sopdkfap-OPAKOPAKFPO'
    });

    const auxInstitution = new Institution();

    beforeEach(inject(function (AuthService,
        InstitutionService, MessageService, FEDERAL_STATE_ACRONYM, $state, $controller) {
        instService = InstitutionService;
        msgService = MessageService;
        statesConst = FEDERAL_STATE_ACRONYM;
        state = $state;
        authService = AuthService;

        AuthService.login(user);

        regInstCtrl = $controller('RegisteredInstitutionController');
        regInstCtrl.institution = institution;
        user.follow(auxInstitution);
    }));

    describe('hasCoverPhoto()', () => {
        it('should be truthy', () => {
            regInstCtrl.institution.cover_photo = 'cover-photo';
            expect(regInstCtrl.hasCoverPhoto()).toBeTruthy();
        });

        it('should be falsy', () => {
            delete regInstCtrl.institution.cover_photo;
            expect(regInstCtrl.hasCoverPhoto()).toBeFalsy();
        });
    });

    describe('userIsFollowing()', () => {
        it('should be truthy', () => {
            user.follow(institution);
            expect(regInstCtrl.userIsFollowing()).toBeTruthy();
        });

        it('should be falsy', () => {
            user.unfollow(institution);
            expect(regInstCtrl.userIsFollowing()).toBeFalsy();
        });
    });

    describe('follow', () => {
        it('should add the inst in the users follow list', () => {
            spyOn(instService, 'follow').and.callFake(() => {
                return {
                    then: function (callback) {
                        return callback(regInstCtrl.institution);
                    }
                }
            });

            spyOn(msgService, 'showToast');

            spyOn(authService, 'save');

            regInstCtrl.follow(regInstCtrl.institution.key);

            expect(msgService.showToast).toHaveBeenCalled();
            expect(authService.save).toHaveBeenCalled();
            expect(instService.follow).toHaveBeenCalled();

            expect(regInstCtrl.userIsFollowing()).toBeTruthy();
        });
    });

    describe('getFederalStateAcronym()', () => {
        it('should return PB', () => {
            regInstCtrl.institution.address = {};
            regInstCtrl.institution.address.federal_state = 'Paraíba';

            expect(regInstCtrl.getFederalStateAcronym()).toEqual('PB');
        });
    });

    describe('limitString()', () => {
        it('should call Utils.limitString', () => {
            spyOn(Utils, 'limitString');

            regInstCtrl.limitString();

            expect(Utils.limitString).toHaveBeenCalled();
        });
    });

    describe('goToInst()', () => {
        it('should call $state.go with the right params', () => {
            spyOn(state, 'go');

            regInstCtrl.goToInst();

            expect(state.go).toHaveBeenCalledWith('app.institution.timeline', {institutionKey: institution.key});
        });
    });
});