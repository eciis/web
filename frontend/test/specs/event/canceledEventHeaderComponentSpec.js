"use strict";

(describe("CanceledEventHeaderComponent", () => {

    let componentController, rootScope,
     scope, event, canceledEventCtrl;

    event = {
        last_modified_by: 'User Test',
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, $rootScope) => {

        componentController = $componentController;
        rootScope = $rootScope;
        scope = rootScope.$new();
        canceledEventCtrl = componentController("canceledEventHeader", scope,
            {event: event});
    }));

    describe('getNameOfLastModified()', () => {
        it('Should return the first name of who modified the event by last', () => {
            expect(canceledEventCtrl.event.last_modified_by).toEqual('User Test');
            expect(canceledEventCtrl.getNameOfLastModified()).toEqual('User');
        });
    });
}));