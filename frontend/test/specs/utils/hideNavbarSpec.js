'use strict';

(describe("Test hiveNavbar", function() {
    beforeEach(module('app'));

    let scope, hideDirective, STATES, element;
    beforeEach(inject(function($rootScope, $compile, STATES, $state) {
        STATES = STATES;
        element = angular.element("<div hide-navbar></div>");
        scope = $rootScope.$new();
        $compile(element)(scope);
        scope.$digest();
        hideDirective = element.isolateScope();
    }));

    it("should have content", function() {
    })
}));