'use strict';

(describe("Test hiveNavbar", function() {
    beforeEach(module('app'));

    let scope, hideDirective, STATES, elem, scopeIs;
    beforeEach(inject(function($rootScope, $compile, STATES, $state) {
        STATES = STATES;

        scope = $rootScope.$new();

        elem = angular.element('<div hide-navbar="bottom"></div>');
        elem = $compile(elem)(scope);
        console.log(elem.isolateScope());
        $rootScope.$digest();
    }));

    it("should have content", function(done) {
        scopeIs = elem.isolateScope();
        console.log(scopeIs)
    })
}));