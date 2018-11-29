'use strict';

(describe('Test SubmitFormListenerService', function() {
    beforeEach(module('app'));

    const user = {
        'name': 'name',
        'key': '123456789',
        'state': 'active'
    }

    let state, scope, messageService, submitFormListenerService, states;

    beforeEach(inject(function($rootScope, MessageService, $state, SubmitFormListenerService, AuthService, STATES) {
        messageService = MessageService;
        scope = $rootScope;
        state = $state;
        states = STATES;
        submitFormListenerService = SubmitFormListenerService;
        spyOn(messageService, 'showConfirmationDialog').and.callFake(function (){
            return {
                then: function(calback) {
                    calback();
                }
            };
        });

        AuthService.login(user);
    }));


    it('Should be call showConfirmationDialog()', function() {
        const element = {};
        scope.$apply();
        submitFormListenerService.addListener('vm.tst', element, scope);
        scope.$apply("vm.tst={name: 'tst'}");
        scope.$apply("vm.tst.name = 'test'");
        scope.$apply(function() {
            state.go(states.HOME);
        });

        expect(messageService.showConfirmationDialog).toHaveBeenCalledWith(
            'event', 
            '', 
            'Deseja sair sem salvar as alterações?');
    });

    it('Should not be call showConfirmationDialog()', function() {
        const element = {};
        scope.$apply();
        submitFormListenerService.addListener('vm.tst', element, scope);
        scope.$apply("vm.tst={name: 'tst'}");
        scope.$apply(function() {
            state.go(states.HOME);
        });

        expect(messageService.showConfirmationDialog).not.toHaveBeenCalled();
    });

    it('Should not be call showConfirmationDialog() if onsubmit is called', function() {
        const element = {};
        scope.$apply();
        submitFormListenerService.addListener('vm.tst', element, scope);
        scope.$apply("vm.tst={name: 'tst'}");
        scope.$apply("vm.tst.name = 'test'");
        element.onsubmit();
        scope.$apply(function() {
            state.go(states.HOME);
        });

        expect(messageService.showConfirmationDialog).not.toHaveBeenCalled();
    });

    it('Should unobserve object', function() {
        const element = {};
        scope.$apply();
        submitFormListenerService.addListener('vm.tst', element, scope);
        scope.$apply("vm.tst={name: 'tst'}");
        scope.$apply("vm.tst.name = 'test'");
        scope.$apply(function() {
            state.go(states.HOME);
        });

        expect(messageService.showConfirmationDialog).toHaveBeenCalledWith(
            'event', 
            '', 
            'Deseja sair sem salvar as alterações?');
        expect(messageService.showConfirmationDialog.calls.count()).toEqual(1);
        
        submitFormListenerService.unobserve("vm.tst");

        scope.$apply(function() {
            state.go(states.HOME);
        });

        expect(messageService.showConfirmationDialog.calls.count()).toEqual(1);
    });
}));