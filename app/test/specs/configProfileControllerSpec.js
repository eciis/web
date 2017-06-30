'use strict';

(describe('Test ConfigProfileController', function() {
    var configCtrl, httpBackend, deffered, scope, userService, createCrtl, state;
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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, UserService) {
        httpBackend = $httpBackend;
        httpBackend.expect('GET', '/api/user').respond(user);
        httpBackend.expect('GET', 'main/main.html').respond(200);
        httpBackend.expect('GET', 'home/home.html').respond(200);
        scope = $rootScope.$new();
        state = $state;
        deffered = $q.defer();
        userService = UserService;
        createCrtl = function() {
            return $controller('ConfigProfileController', 
                {
                    scope: scope,
                    userService: userService
                });
        };
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
        expect(configCtrl.newUser.isValid()).toEqual(false);

        configCtrl.finish();
        expect($mdToast.show).toHaveBeenCalled(); 
    }));

    it('Spy save user in success case', function() {
        spyOn(userService, 'save').and.returnValue(deffered.promise);
        deffered.resolve();
        configCtrl.finish();
        expect(userService.save).toHaveBeenCalled();
    });

    it('User of system has changed', inject(function() {
        spyOn(state, 'go');
        spyOn(userService, 'save').and.returnValue(deffered.promise);
        deffered.resolve(newUser);

        expect(configCtrl.user.name).toEqual(user.name);
        expect(configCtrl.user.email).toEqual(user.email);
        expect(configCtrl.user.cpf).toEqual(user.cpf);

        var promise = configCtrl.finish();

        promise.then(function() {
            expect(configCtrl.user.name).toEqual(newUser.name);
            expect(configCtrl.user.email).toEqual(newUser.email);
            expect(configCtrl.user.cpf).toEqual(newUser.cpf);

            expect(state.go).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('app.home');
            expect(userService.save).toHaveBeenCalled();
        });        
    }));
}));