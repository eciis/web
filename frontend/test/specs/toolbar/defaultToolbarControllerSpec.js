'use strict';

describe('DefaultToolbarController test', () => {
    beforeEach(module('app'));

    let scope, defaultToolbarCtrl, window;

    beforeEach(inject(function ($componentController, $rootScope, SCREEN_SIZES, $window) {
        scope = $rootScope.$new();
        window = $window;
        defaultToolbarCtrl = $componentController('defaultToolbar', null, {
            scope: scope,
            SCREEN_SIZES: SCREEN_SIZES,
            $window: window
        });
    }));

    describe('isMobileScreen()', () => {
        it('should call isMobileScreen', () => {
            spyOn(Utils, 'isMobileScreen');
            defaultToolbarCtrl.isMobileScreen();
            expect(Utils.isMobileScreen).toHaveBeenCalled();
        });
    });

    describe('goBack()', () => {
        it('should call back()', () => {
            spyOn(window.history, 'back');
            defaultToolbarCtrl.goBack();
            expect(window.history.back).toHaveBeenCalled();
        });
    });
});