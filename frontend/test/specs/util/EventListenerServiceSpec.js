'use strict';

(describe('Test EventListenerService', function() {
    var service, rootScope;

    var callback = function (){};

    var events = ['DELETE_INSTITUTION', 'LEFT_INSTITUTION'];

    beforeEach(module('app'));

    beforeEach(inject(function(EventListenerService, $rootScope) {
        service = EventListenerService;
        rootScope = $rootScope;
    }));

    describe('EventListenerService  multipleEventsListener', function() {

        it('should call rootScope.$on()', function() {
            spyOn(rootScope, '$on').and.callThrough();

            service.multipleEventsListener(events, callback);
            expect(rootScope.$on).toHaveBeenCalledWith(events, callback);
        });
    });

    describe('EventListenerService  eventListener', function() {

        it('should call rootScope.$on()', function() {
            spyOn(rootScope, '$on').and.callThrough();

            service.eventListener(events[0], callback);
            expect(rootScope.$on).toHaveBeenCalledWith(events[0], callback);
        });
    });
}));