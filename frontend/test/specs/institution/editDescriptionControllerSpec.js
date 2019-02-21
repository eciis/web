'use strict';

describe('Test Edit Description Institution', function() {
    beforeEach(module('app'));

    var data, institution, editDescriptionCtrl, httpBackend,
        observerRecorderService, scope, state, mdDialog, institutionService;

    var user = new User({
                institutions: [],
                follows: []
            });

    const fakeCallback = function(){
        const fakeResponse = callback => callback();
        return {
            then: fakeResponse,
            catch: fakeResponse,
            finally: fakeResponse
        };
    };
        
    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService,
                                     ObserverRecorderService, $mdDialog, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        observerRecorderService = ObserverRecorderService;

        AuthService.login(user);

        institution = {
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

        institution = new Institution(data);

        state.params.institution = institution;
        editDescriptionCtrl = $controller('EditDescriptionController',{
            scope: scope,
            institutionService: institutionService,
            institution: institution
        });
        editDescriptionCtrl.$onInit();
    }));

    describe('save()', function () {
        beforeEach(function() {
            spyOn(institutionService, 'update').and.callFake(fakeCallback);
            spyOn(mdDialog, 'hide').and.callThrough();
        });

        it('should update and call functions', function () {
            editDescriptionCtrl.institution.description = "edit description";
            editDescriptionCtrl.save();            
            expect(institutionService.update).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
});