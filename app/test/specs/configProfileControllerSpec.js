'use strict';

(describe('Test ConfigProfileController', function() {
    var configCtrl, httpBackend, deffered, scope, userService, createCrtl;
    var splab = {
        name: 'SPLAB',
        key: '987654321' 
    };

    var user = {
        name: 'Maiana',
        cpf: '121.445.044-07',
        email: 'maiana.brito@ccc.ufcg.edu.br',
        institutions: [splab]
    };

    var newUser = {
        name: 'Maiana Brito',
        cpf: '121.115.044-07',
        email: 'maiana.brito@ccc.ufcg.edu.br',
        institutions: [splab]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, UserService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        deffered = $q.defer();
        userService = UserService;
        createCrtl = function() {
            return $controller('ConfigProfileController', {scope: scope});
        };
        httpBackend.when('GET', '/api/user').respond(user);
        configCtrl = createCrtl();
        httpBackend.flush();   
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    it("User isn't valid", inject(function($mdToast){
        spyOn($mdToast, 'show');

        var userInvalid = {
            name: 'Maiana Brito',
            cpf: '',
            email: 'maiana.brito@ccc.ufcg.edu.br',
            institutions: [splab]
        };
        configCtrl.newUser = new User(userInvalid);
        configCtrl.finish();

        expect($mdToast.show).toHaveBeenCalled();   
    }));

    it('Spy save user in success case', function() {
        spyOn(userService, 'save').and.returnValue(deffered.promise);
        deffered.resolve();
        scope.$apply();
        configCtrl.finish();
        expect(userService.save).toHaveBeenCalled();
    });

    it('User of system has changed', function() {
        expect(configCtrl.user.name).toEqual(user.name);
        expect(configCtrl.user.email).toEqual(user.email);
        expect(configCtrl.user.cpf).toEqual(user.cpf);

        httpBackend.when('PATCH', '/api/user').respond(newUser);
        configCtrl.finish();
        httpBackend.flush();

        expect(configCtrl.user.name).toEqual(newUser.name);
        expect(configCtrl.user.email).toEqual(newUser.email);
        expect(configCtrl.user.cpf).toEqual(newUser.cpf);
    });

    it('Test state.go in success case', inject(function($state) {
        spyOn($state, 'go');

        httpBackend.when('PATCH', '/api/user').respond(newUser);
        configCtrl.finish();
        httpBackend.flush();

        expect($state.go).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('app.home');
    }));

}));