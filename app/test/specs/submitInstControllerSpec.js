'use strict';

describe('Test SubmitInstController', function() {
    var submitInstCtrl, scope, institutionService, state, deferred;
    var mdToast, mdDialog, http, inviteService, httpBackend;
    var institution = {
            name: "name",
            image_url: "",
            email: "email",
            state: "active"
    };
    var institutions = [{
        name: 'Splab',
        key: 'institutuion_key', 
        followers: [], 
        members: []
    }];
    var legal_nature = [
        {"value":"public", "name":"Pública"}, 
        {"value":"private", "name":"Privada"},
        {"value":"philanthropic", "name":"Filantrópica"}
    ];
    var occupation_area = [
        {"value":"official laboratories", "name":"Laboratórios Oficiais"}, 
        {"value":"government agencies", "name":"Ministérios e outros Órgãos do Governo"}, 
        {"value":"funding agencies", "name":"Agências de Fomento"}, 
        {"value":"research institutes", "name":"Institutos de Pesquisa"}, 
        {"value":"colleges", "name":"Universidades"},
        {"value":"other", "name":"Outra"}
    ];
    var userData = {
        name: 'name',
        key: 'user-key',
        current_institution: {key: "institutuion_key"},
        institutions: institutions,
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent'
        }]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $q, $state, $mdToast, 
        $rootScope, $mdDialog, $http, InstitutionService, InviteService, AuthService) {
        scope = $rootScope.$new();
        AuthService.user = new User(userData);
        submitInstCtrl = $controller('SubmitInstController', {scope: scope});
        httpBackend = $httpBackend;
        deferred = $q.defer();
        state = $state;
        http = $http;
        mdDialog = $mdDialog;
        mdToast = $mdToast;
        institutionService = InstitutionService;
        inviteService = InviteService;
        submitInstCtrl.institution = institution;
        httpBackend.expectGET('/api/user').respond(userData);
        httpBackend.expectGET('institution/legal_nature.json').respond(legal_nature);
        httpBackend.expectGET('institution/occupation_area.json').respond(occupation_area);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.flush();  
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    // TODO create tests
    // @author Ruan Eloy,  CreatedOn: 14/07/17  
});