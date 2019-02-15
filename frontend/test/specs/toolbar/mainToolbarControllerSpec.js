'use strict';

describe('MainToolbarController test', () => {
    beforeEach(module('app'));

    let state, mainToolbarCtrl, scope;

    const items = [
        {
            options: ['a', 'b', 'c'] ,
            action: option => {},
            title: 'test'
        },
        {
            options: ['d', 'e', 'f'],
            action: option => { },
            title: 'test2'
        }
    ]

    beforeEach(inject(function ($componentController, $state, $rootScope, SCREEN_SIZES) {
        state = $state;
        scope = $rootScope.$new();
        mainToolbarCtrl = $componentController('mainToolbar', null, {
            scope: scope,
            SCREEN_SIZES: SCREEN_SIZES
        });
    }));

    describe('changeState()', () => {
        it('should call state.go', () => {
            spyOn(state, 'go');

            mainToolbarCtrl.changeState();

            expect(state.go).toHaveBeenCalled();
        });
    });

    describe('isMobileScreen()', () => {
        it('should return true for a screen <= 475', () => {
            spyOn(Utils, 'isMobileScreen');

            mainToolbarCtrl.isMobileScreen()
            expect(Utils.isMobileScreen).toHaveBeenCalled();
        });
    });

    describe('handleOptionAction()', () => {
        it("should change the items' title when noSearch is false", () => {
            spyOn(items[0], 'action');
            mainToolbarCtrl.noSearch = false;
            expect(items[0].title).toEqual('test');

            mainToolbarCtrl.handleOptionAction(items[0], items[0].options[0]);

            expect(items[0].action).toHaveBeenCalledWith(items[0].options[0]);
            expect(items[0].title).toEqual(items[0].options[0]);
        });

        it('should not change the items title when noSearch is true', () => {
            spyOn(items[0], 'action');
            mainToolbarCtrl.noSearch = true;

            mainToolbarCtrl.handleOptionAction(items[0], items[0].options[1]);

            expect(items[0].action).toHaveBeenCalledWith(items[0].options[1]);
            expect(items[0].title).not.toEqual(items[0].options[1]);
            expect(mainToolbarCtrl.previousMenuOption).toEqual(items[0].options[1]);
        });
    });

    describe('sort()', () => {
        beforeEach(() => {
            mainToolbarCtrl.sortFunc = () => {};
            spyOn(mainToolbarCtrl, 'sortFunc');
        });

        it('should set sortParam to name when it is not defined', () => {
            mainToolbarCtrl.sort();
            expect(mainToolbarCtrl.sortParam).toEqual('name');
            expect(mainToolbarCtrl.sortFunc).toHaveBeenCalled();
        });

        it('should set sortParam to name when it is equal to -name', () => {
            mainToolbarCtrl.sortParam = '-name'
            mainToolbarCtrl.sort();
            expect(mainToolbarCtrl.sortParam).toEqual('name')
            expect(mainToolbarCtrl.sortFunc).toHaveBeenCalled();
        });

        it('should set sortParam to -name when it is equal to name', () => {
            mainToolbarCtrl.sortParam = 'name';
            mainToolbarCtrl.sort();
            expect(mainToolbarCtrl.sortParam).toEqual('-name')
            expect(mainToolbarCtrl.sortFunc).toHaveBeenCalled();
        });
    });
});