'use strict';

describe('Test Institution Model:', function() {
    beforeEach(module('app'));

    var data, institution;

    var invite = {
        inviteKey: 'inviteKey',
        suggestion_institution_name: 'Stub Institution'
    };

    var testInst = new Institution({
        name: 'Test Institution',
        state: 'active',
        key: 'testInstKey'
    }, {});

    beforeEach(function() {
        data = {
            name: 'InstName',
            address: {
                street: 'StreetName',
                number: 1,
                neighbourhood: 'NeighbourhoddName',
                city: 'CityName',
                federal_state: 'FederalStateName',
                country: 'Brasil'
            },
            state: 'active',
            leader: 'LeaderName',
            legal_nature: 'Public',
            actuation_area: 'Laboratory',
            description: 'institutionDescription',
            sent_invitations: [],
            parent_institution: null,
            children_institutions: [],
            key: 'instKey'
        };

        institution = new Institution(data, {});
    });

    describe('isValidAddress()', function() {
        it('should be invalid because of empty street', function() {
            institution.address.street = "";
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined street', function() {
            institution.address.street = undefined;
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of empty neighbourhood', function() {
            institution.address.neighbourhood = "";
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined neighbourhood', function() {
            institution.address.neighbourhood = undefined;
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of empty city', function() {
            institution.address.city = "";
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined city', function() {
            institution.address.city = undefined;
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of empty federal_state', function() {
            institution.address.federal_state = "";
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined federal_state', function() {
            institution.address.federal_state = undefined;
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be valid if address is correct', function() {
            expect(institution.isValidAddress()).toBeTruthy();
        })

        it('should be valid if country is different of Brasil', function() {
            institution.address.country = "Germany";
            expect(institution.isValidAddress()).toBeTruthy();
        });
        
    });

    describe('isValid()', function() {
        it('should be invalid because of empty name', function() {
            institution.name = "";
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined name', function() {
            institution.name = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty legal_nature', function() {
            institution.legal_nature = "";
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined legal_nature', function() {
            institution.legal_nature = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty actuation_area', function() {
            institution.actuation_area = "";
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined actuation_area', function() {
            institution.actuation_area = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty leader', function() {
            institution.leader = "";
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined leader', function() {
            institution.leader = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty description', function() {
            institution.description = "";
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined description', function() {
            institution.description = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of invalid address', function() {
            institution.address.street = undefined;
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be valid', function() {
            expect(institution.isValid()).toBeTruthy();
        });
    });

    describe('addInvite()', function() {

        it('should increase sent_invitations list of institution in +1', function() {
            expect(institution.sent_invitations.length).toEqual(0);
            institution.addInvite(invite);
            expect(institution.sent_invitations.length).toEqual(1);
        });
    });

    describe('createStub()', function() {

        it('should returns a stub institution with pending state', function() {
            var stub = new Institution({name: 'Stub Institution', state: 'pending'}, {});
            expect(institution.createStub(invite)).toEqual(stub);
        });
    });

    describe('addParentInst()', function() {

        it('should set the parent_institution of null to an institution', function() {
            expect(institution.parent_institution).toEqual(null);
            institution.addParentInst(testInst);
            expect(institution.parent_institution).toEqual(testInst);
        });
    });

    describe('addChildInst()', function() {

        it('should increse children_institutions list of institution in one', function() {
            expect(institution.children_institutions.length).toEqual(0);
            institution.addChildInst(testInst);
            expect(institution.children_institutions.length).toEqual(1);
        });

        it('should not add the same institution again', function() {
            institution.addChildInst(testInst);
            expect(institution.children_institutions.length).toEqual(1);
            
            var sameInst = Object.assign({}, testInst);
            institution.addChildInst(sameInst);
            expect(institution.children_institutions.length).toEqual(1);
        });
    });
});