'use strict';

describe('Test Institution Model:', function() {
    beforeEach(module('app'));

    var data, institution;

    var stub = {
        name: 'StubName',
        state: 'active',
        key: 'stubKey',
    }

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
            parent_institution: null,
            children_institutions: [],
            key: ''
        };
    });

    describe('isValidAddress()', function() {
        it('should be invalid because of empty street', function() {
            data.address.street = "";
            institution = new Institution(data, {});
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined street', function() {
            data.address.street = undefined;
            institution = new Institution(data, {});
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of empty neighbourhood', function() {
            data.address.neighbourhood = "";
            institution = new Institution(data, {});
            expect(institution.isValidAddress()).toBeFalsy();
        });

        it('should be invalid because of undefined neighbourhood', function() {
            data.address.neighbourhood = undefined;
            institution = new Institution(data, {});
            expect(institution.isValidAddress()).toBeFalsy();
        });
        
    });

    describe('isValid()', function() {
        it('should be invalid because of empty name', function() {
            data.name = "";
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined name', function() {
            data.name = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty legal_nature', function() {
            data.legal_nature = "";
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined legal_nature', function() {
            data.legal_nature = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty actuation_area', function() {
            data.actuation_area = "";
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined actuation_area', function() {
            data.actuation_area = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty leader', function() {
            data.leader = "";
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined leader', function() {
            data.leader = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of empty description', function() {
            data.description = "";
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined description', function() {
            data.description = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be invalid because of invalid address', function() {
            data.address.street = undefined;
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeFalsy();
        });

        it('should be valid', function() {
            institution = new Institution(data, {});
            expect(institution.isValid()).toBeTruthy();
        });
    });
});