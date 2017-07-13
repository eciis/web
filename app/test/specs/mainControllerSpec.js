'use strict';
(describe('Test MainController', function() {
    var mainCtrl, httpBackend, scope, createCtrl, state;
    var mayza = {
        name: 'Mayza',
        institutions: [],
        invite: []
    };
    var certbio = {
        name: 'Certbio',
        key: '123456789'
    };
    var splab = {
        name: 'Splab',
        key: '1239'
    };
    mayza.institutions = [certbio.key, splab.key]
    mayza.current_institution = certbio.key
    beforeEach(module('app'));
    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        httpBackend.expect('GET', '/api/user').respond(mayza);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('MainController', {
                scope: scope
            });
        };
        mainCtrl = createCtrl();
        httpBackend.flush();   
    }));
    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
    describe('MainController functions', function() {
        it('Should be active', function() {
            expect(mainCtrl.isActive(certbio.key)).toBe(true);            
        });
        it('Should be not active', function() {
            expect(mainCtrl.isActive(splab.key)).toBe(false);            
        });
        it('Should change active institution', function() {
            spyOn(mainCtrl.user, 'changeInstitution');
            mainCtrl.changeInstitution(splab.key);
            expect(mainCtrl.user.changeInstitution).toHaveBeenCalledWith(splab.key);
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
        it('User should not be member e-cis', function(){
            expect(mainCtrl.isMemberEcis()).toBe(false);  
        });
    });

}));