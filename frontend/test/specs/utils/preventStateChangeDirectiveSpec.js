'use strict';

(describe("Test preventStateChangeDirective", function() {
    beforeEach(module('app'));

    var element, submitFormListenerService, scope;

    beforeEach(inject(function($compile, $rootScope, SubmitFormListenerService) {
        submitFormListenerService = SubmitFormListenerService;
        scope = $rootScope;
        
        spyOn(submitFormListenerService, 'addListener').and.callFake(function () {});
        element = $compile("<form name='tst' prevent-state-change='ctrl.post'></form>")($rootScope);
    }));

    it('Should be call addListener()', function() {
        expect(submitFormListenerService.addListener).toHaveBeenCalledWith('ctrl.post', element[0], scope);
    });
}));