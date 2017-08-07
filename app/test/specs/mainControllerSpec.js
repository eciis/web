'use strict';

(describe('Test MainController', function() {
    var mainCtrl, httpBackend, scope, createCtrl, state, instService, authService;
    var mayza = {
        name: 'Mayza',
        key: 'user-key',
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "INSTITUTION",
            'status': 'sent',
            'stub_institution_key': '00001'
        }]
    };
    var certbio = {
        name: 'Certbio',
        key: '123456789',
        admin: mayza.key

    };

    var splab = {
        name: 'Splab',
        key: '1239'
    };
    mayza.institutions = [certbio, splab];
    mayza.institutions_admin = [certbio.key];
    mayza.current_institution = certbio;

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;
        authService = AuthService;

        authService.getCurrentUser = function() {
            return new User(mayza);
        };

        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "search_panel.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);
        createCtrl = function() {
            return $controller('MainController', {
                scope: scope,
                AuthService: authService
            });
        };
        mainCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    describe('main()', function() {

        it("should change state to config_profile if user name is Unknown", function() {
            var unknownUser = {
              name: 'Unknown',
              invites: [],
              institutions: [splab],
              state: 'active'
            };

            authService.getCurrentUser = function() {
                return new User(unknownUser);
            };

            spyOn(state, 'go');

            mainCtrl = createCtrl();

            expect(state.go).toHaveBeenCalledWith('config_profile');
        });

        it("should change state to submit_institution if user have pedding invates", function() {
            spyOn(state, 'go');

            mainCtrl = createCtrl();

            expect(state.go).toHaveBeenCalledWith('submit_institution', {institutionKey: '00001'});
        });
    });

    describe('MainController functions', function() {
        it('Should be active', function() {
            expect(mainCtrl.isActive(certbio)).toBe(true);
        });
        it('Should be not active', function() {
            expect(mainCtrl.isActive(splab)).toBe(false);
        });
        it('Should change active institution', function() {
            spyOn(mainCtrl.user, 'changeInstitution');

            var user_inst = {
                name: 'user_inst',
                key: 'veqw56eqw7r89',
                invites: [{
                    'invitee': 'user@email.com',
                    'suggestion_institution_name': "Suggested Name",
                    'type_of_invite': "institution",
                    'status': 'sent'
                }]
            };

            user_inst.institutions = [splab, certbio];
            mainCtrl.user = new User(user_inst);

            expect(mainCtrl.user.current_institution).toBe(splab);

            mainCtrl.user.changeInstitution(certbio);

            expect(mainCtrl.user.current_institution).toBe(certbio);
        });
        it('Should call state.go() in function goTo()', function(){
            spyOn(state, 'go');
            mainCtrl.goTo('app.home');
            expect(state.go).toHaveBeenCalledWith('app.home');
        });
        it('Should call state.go() in function goToInstitution()', function(){
            spyOn(state, 'go');
            mainCtrl.goToInstitution(splab.key);
            expect(state.go).toHaveBeenCalledWith('app.institution', {institutionKey: '1239'});
        });

        it('Should call makeSearch() in function showMenu()', function(done){
            var documents = [{name: splab.name, id: splab.key}];
            mainCtrl.search = splab.name;
            mainCtrl.finalSearch = mainCtrl.search;
            spyOn(mainCtrl, 'makeSearch').and.callThrough();
            spyOn(instService, 'searchInstitutions').and.callThrough();
            spyOn(mainCtrl, 'openMenu');
            httpBackend.expect('GET', "api/search/institution?name=" + splab.name + "&state=active").respond(documents);
            mainCtrl.showMenu('$event').then(function() {
                expect(mainCtrl.makeSearch).toHaveBeenCalled();
                expect(mainCtrl.openMenu).toHaveBeenCalled();
                expect(instService.searchInstitutions).toHaveBeenCalled();
                done();
            });
            httpBackend.flush();
        });

        it('Should call searchInstitutions in makeSearch', function(done) {
            var documents = [{name: splab.name, id: splab.key}];
            mainCtrl.search = splab.name;
            mainCtrl.finalSearch = mainCtrl.search;
            spyOn(instService, 'searchInstitutions').and.callThrough();
            httpBackend.expect('GET', "api/search/institution?name=" + splab.name + "&state=active").respond(documents);
            mainCtrl.makeSearch().then(function() {
                 expect(instService.searchInstitutions).toHaveBeenCalledWith(mainCtrl.finalSearch, 'active');
                 expect(mainCtrl.institutions).toEqual(documents);
                 done();
            });
            httpBackend.flush();
        });

        it('User should not be admin of your current institution', function(){
            expect(mainCtrl.isAdmin(mainCtrl.user.current_institution.key)).toBe(true);
        });
    });
}));