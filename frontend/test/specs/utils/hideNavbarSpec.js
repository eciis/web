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
        it("In state NOTIFICATION should show top toolbar", function() {
            state.current.name = STATES_CONST.NOTIFICATION;
            expect(hideDirective.isTopToolbarAllowed()).toBeTruthy();
        })
        it("In all nested state of INSTITUTION shouldn't show top toolbar", function() {
            state.current.name = STATES_CONST.INST_TIMELINE;
            expect(hideDirective.isTopToolbarAllowed()).toBeFalsy();
        })
    })

    describe('isBottomToolbarAllowed', function(){
        it("In state CREATE_EVENT shouldn't show top toolbar", function() {
            state.current.name = STATES_CONST.CREATE_EVENT;
            expect(hideDirective.isBottomToolbarAllowed()).toBeFalsy();
        })
        it("In all nested state of INSTITUTION should show top toolbar", function() {
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
        it("When the current state is any of the states of the institution," +
        "you should set the bottom and top toolbar element of the property to None.", function() {
            state.current.name = STATES_CONST.INST_TIMELINE;
            scope.isStateAllowedTopMobile = scope.isTopToolbarAllowed();
            scope.isStateAllowedBottom  = scope.isBottomToolbarAllowed();
            expect(scope.isStateAllowedTopMobile).toBeFalsy();
            expect(scope.isStateAllowedBottom).toBeTruthy();

            scope.initialToolbarDisplayState();

            expect(hideDirective.hideElement).toHaveBeenCalledWith(hideDirective.bottomToolbar);
            expect(hideDirective.bottomToolbar.style).toEqual({display: 'none'});
            expect(hideDirective.topTollbar.style).toEqual({display: 'none'});
        })
    })

    describe('hideElement', function(){
        beforeEach(function(){
            hideDirective.topTollbar = {style:{
                    display: 'grid'
                }};
            hideDirective.bottomToolbar = {style:{
                display: 'flex'
            }};
            spyOn(hideDirective, 'hideElement').and.callThrough();
        })
        it("should change property of element to none", function() {
            expect(hideDirective.topTollbar.style).toEqual({display: 'grid'});
            scope.hideElement(hideDirective.topTollbar);
            expect(hideDirective.topTollbar.style).toEqual({display: 'none'});
        })
        it("should change property of element to none", function() {
            expect(hideDirective.bottomToolbar.style).toEqual({display: 'flex'});
            scope.hideElement(hideDirective.bottomToolbar);
            expect(hideDirective.bottomToolbar.style).toEqual({display: 'none'});
        })
    })
}));