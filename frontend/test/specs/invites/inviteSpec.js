"use strict";

(describe("Test Invite model", function () {

    let invite, institution, requestedInstitution;

    beforeEach(function () {

        institution = new Institution({
            state: 'active'
        });

        requestedInstitution = new Institution({
            state: 'active'
        });

        invite = new Invite({
            institution: institution,
            requested_isntitution: requestedInstitution,
            type_of_invite: 'USER',
            invitee: 'user@email'
        });

    });

    describe('Test isValid', function () {

        it('should be true', function () {
            expect(invite.isValid()).toBeTruthy();
        });

        it('should be false, when there no type_of_invite', function () {
            invite.type_of_invite = '';
            expect(invite.isValid()).toBeFalsy();
        });

        it('should be false, when there is no invitee when it is needed', function () {
            invite.type_of_invite = 'INSTITUTION_REQUEST';
            invite.invitee = '';
            expect(invite.isValid()).toBeFalsy();
        })
    });
    
    describe('Test areInstitutionsValid', function () {

        it('should be true, when both institutions are active', function () {
            expect(invite.areInstitutionsValid()).toBe(true);
        });

        it('should be false, when request institution is not active', function () {
            institution.state = "inactive";
            expect(invite.areInstitutionsValid()).toBe(true);
        });

        it('should be false, when request requested_institution is not active', function () {
            requestedInstitution.state = "inactive";
            expect(invite.areInstitutionsValid()).toBe(true);
        });
    });

}))