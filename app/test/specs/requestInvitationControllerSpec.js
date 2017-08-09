'use strict';

(describe('Test RequestInvitationController', function() {

    var requestInvCtrl, httpBackend, scope, institutionService, createCtrl, state;

    var SEARCH_INST_URI = "api/search/institution?";
    var INST_URI = "/api/institutions/";

    var splab = {
        name: 'SPLAB',
        key: '987654321',
        id: '987654321',
        photo_url: "photo_url"
    };

    var certbio = {
        name: 'CERTBIO',
        key: '123456789',
        id: '123456789',
        photo_url: "photo_url"
    };

    var maiana = {
        name: 'Maiana',
        key: '12107',
        email: 'maiana.brito@ccc.ufcg.edu.br'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;

        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        createCtrl = function() {
            return $controller('RequestInvitationController',
                {
                    scope: scope,
                    institutionService: institutionService
                });
        };
        requestInvCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('RequestInvitationController functions', function() {

        describe('makeSearch()', function(){
            it('Should return splab', function(done){
                httpBackend.expect('GET', SEARCH_INST_URI + "name=" + splab.name + "&state=active").respond([splab]);
                requestInvCtrl.search = splab.name;
                requestInvCtrl.finalSearch = splab.name;

                spyOn(institutionService, 'searchInstitutions').and.callThrough();

                requestInvCtrl.makeSearch().then(function() {
                    expect(institutionService.searchInstitutions).toHaveBeenCalledWith(
                        requestInvCtrl.finalSearch, 'active');
                    expect(requestInvCtrl.institutions).toEqual([splab]);
                    done();
                });
                httpBackend.flush();            
            });

        });

        describe('selectInstitution()', function(){
            it('Should select certbio', function(done){
                httpBackend.expect('GET', INST_URI + certbio.id).respond(certbio);
                spyOn(institutionService, 'getInstitution').and.callThrough();
                expect(requestInvCtrl.institutionSelect).toEqual({});

                requestInvCtrl.selectInstitution(certbio).then(function() {
                    expect(requestInvCtrl.institutionSelect).toEqual(certbio);
                    expect(institutionService.getInstitution).toHaveBeenCalled();
                    done();
                });      
                httpBackend.flush();
            });
        });

        describe('showFullInformation()', function(){
            it('Should showFullInformation be true', function(){
                requestInvCtrl.institutions = [certbio];
                requestInvCtrl.institutionSelect = certbio;
                
                expect(requestInvCtrl.showFullInformation(certbio)).toEqual(true);
            });

            it('Should showFullInformation be false', function(){
                requestInvCtrl.institutions = [];
                expect(requestInvCtrl.showFullInformation()).toEqual(false);

                requestInvCtrl.institutions = [certbio, splab];
                requestInvCtrl.institutionSelect = certbio;
                expect(requestInvCtrl.showFullInformation(splab)).toEqual(false);
            });
        });

        describe('showMessage()', function(){
            it('Should showMessage be true', function(){
                requestInvCtrl.institutions = [];
                requestInvCtrl.wasSearched = true;

                expect(requestInvCtrl.showMessage()).toEqual(true);
            });

            it('Should showMessage be false', function(){
                requestInvCtrl.institutions = [];
                requestInvCtrl.wasSearched = false;
                expect(requestInvCtrl.showMessage()).toEqual(false);

                requestInvCtrl.institutions = [certbio];
                requestInvCtrl.wasSearched = true;
                expect(requestInvCtrl.showMessage()).toEqual(false);
            });
        });
    });
}));