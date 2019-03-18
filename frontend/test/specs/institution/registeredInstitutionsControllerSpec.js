'use strict';

describe('registeredInstitutionController test', () => {
    beforeEach(module('app'));

    let instService, msgService, statesConst, state, regInstCtrl, authService;

    const user = new User({
        follows: [],
        institutions: [],
        last_seen_institutions: new Date()
    });

    const institution = new Institution({
        name: 'institution',
        key: 'sopdkfap-OPAKOPAKFPO',
        creation_date: new Date()
    });

    const auxInstitution = new Institution();

    beforeEach(inject(function (AuthService,
        InstitutionService, MessageService, FEDERAL_STATE_ACRONYM, $state, $controller) {
        instService = InstitutionService;
        msgService = MessageService;
        statesConst = FEDERAL_STATE_ACRONYM;
        state = $state;
        authService = AuthService;

        regInstCtrl = $controller('RegisteredInstitutionController');
        regInstCtrl.user = user;
        regInstCtrl.institution = institution;
        regInstCtrl.user.follow(auxInstitution);
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
            regInstCtrl.user.follow(institution);
            expect(regInstCtrl.userIsFollowing()).toBeTruthy();
        });

        it('should be falsy', () => {
            regInstCtrl.user.unfollow(institution);
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

            spyOn(msgService, 'showInfoToast');

            spyOn(authService, 'save');

            regInstCtrl.follow(regInstCtrl.institution.key);

            expect(msgService.showInfoToast).toHaveBeenCalledWith('Seguindo institution');
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

    describe('hasSeenInstitution', () => {
        it("should return true when the lastSeen property is > institution's creation_date", () => {
            regInstCtrl.user.last_seen_institutions = new Date();

            expect(regInstCtrl.hasSeenInstitution()).toEqual(true);
        });

        it("should return false when the lastSeen property is < institution's creation_date", () => {
            regInstCtrl.institution.creation_date = new Date();

            expect(regInstCtrl.hasSeenInstitution()).toEqual(false);
        });
    });
});