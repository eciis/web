'use strict';

describe('DefaultToolbarController test', () => {
    beforeEach(module('app'));

    let scope, whiteToolbarCtrl, window;

    beforeEach(inject(function ($componentController, $rootScope, SCREEN_SIZES, $window) {
        scope = $rootScope.$new();
        window = $window;
        whiteToolbarCtrl = $componentController('whiteToolbar', null, {
            scope: scope,
            SCREEN_SIZES: SCREEN_SIZES,
            $window: window
        });
    }));

    describe('isMobileScreen()', () => {
        it('should call isMobileScreen', () => {
            spyOn(Utils, 'isMobileScreen');
            whiteToolbarCtrl.isMobileScreen();
            expect(Utils.isMobileScreen).toHaveBeenCalled();
        });
    });

    describe('goBack()', () => {
        it('should call back()', () => {
            spyOn(window.history, 'back');
            whiteToolbarCtrl.goBack();
            expect(window.history.back).toHaveBeenCalled();
        });
    });
});