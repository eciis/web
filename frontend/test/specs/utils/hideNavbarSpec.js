'use strict';

(describe("Test hiveNavbar", function() {
    beforeEach(module('app'));

    let scope, hideDirective, STATES_CONST, elem, state;
    beforeEach(inject(function($rootScope, $compile, STATES, $state) {
        STATES_CONST = STATES;
        state = $state;
        scope = $rootScope.$new();

        elem = angular.element('<div hide-navbar="bottom"></div>');
        elem = $compile(elem)(scope);
        hideDirective = elem.scope();
        $rootScope.$digest();
    }));

    describe('isTopToolbarAllowed', function(){
        it("should be true", function() {
            state.current.name = STATES_CONST.NOTIFICATION;
            expect(hideDirective.isTopToolbarAllowed()).toBeTruthy();
        })
        it("should be false", function() {
            state.current.name = STATES_CONST.INST_TIMELINE;
            expect(hideDirective.isTopToolbarAllowed()).toBeFalsy();
        })
    })

    describe('isBottomToolbarAllowed', function(){
        it("should be false", function() {
            state.current.name = STATES_CONST.CREATE_EVENT;
            expect(hideDirective.isBottomToolbarAllowed()).toBeFalsy();
        })
        it("should be true", function() {
            state.current.name = STATES_CONST.INST_TIMELINE;
            expect(hideDirective.isBottomToolbarAllowed()).toBeTruthy();
        })
    })

    describe('initialToolbarDisplayState', function(){
        beforeEach(function(){
            hideDirective.topTollbar = {style:{
                    display: 'grid'
                }};
            hideDirective.bottomToolbar = {style:{
                display: 'flex'
            }};
            spyOn(hideDirective, 'hideElement').and.callThrough();
        })
        it("should hide the bottom toolbar", function() {
            state.current.name = STATES_CONST.INST_TIMELINE;
            scope.initialToolbarDisplayState();
            expect(hideDirective.hideElement).toHaveBeenCalledWith(hideDirective.bottomToolbar);
        })
        it("should not hide the bottom toolbar", function() {
            state.current.name = STATES_CONST.CREATE_EVENT;
            scope.initialToolbarDisplayState();
            expect(hideDirective.hideElement).toHaveBeenCalledWith(hideDirective.topTollbar);
        })
    })
}));