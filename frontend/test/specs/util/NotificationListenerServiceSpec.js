'use strict';

(describe('Test NotificationListenerService', function() {
    var service, rootScope;

    var callback = function (){};
     
    var events = ['DELETE_INSTITUTION', 'LEFT_INSTITUTION'];

    beforeEach(module('app'));

    beforeEach(inject(function(NotificationListenerService, $rootScope) {
        service = NotificationListenerService;
        service.callback = callback;
        rootScope = $rootScope;
    }));

    describe('NotificationListenerService  multipleEventsListener', function() {

        it('should call rootScope.$on()', function() {
            spyOn(rootScope, '$on').and.callThrough();
            spyOn(service, 'eventListener').and.callThrough();
            spyOn(service, 'callback');

            service.multipleEventsListener(events, service.callback);
            expect(service.eventListener).toHaveBeenCalledWith(events[0], service.callback);
            expect(service.eventListener).toHaveBeenCalledWith(events[1], service.callback);
            expect(rootScope.$on).toHaveBeenCalled();

            rootScope.$emit("EVENT", {});
            expect(service.callback).not.toHaveBeenCalled();
            rootScope.$emit("LEFT_INSTITUTION", {});
            expect(service.callback).toHaveBeenCalled();
            
        });
    });

    describe('NotificationListenerService  eventListener', function() {

        it('should call rootScope.$on()', function() {
            spyOn(rootScope, '$on').and.callThrough();
            spyOn(service, 'callback');

            service.eventListener(events[0], service.callback);
            expect(rootScope.$on).toHaveBeenCalled();

            rootScope.$emit("LEFT_INSTITUTION", {});
            expect(service.callback).not.toHaveBeenCalled();
            rootScope.$emit("DELETE_INSTITUTION", {});
            expect(service.callback).toHaveBeenCalled();
            
        });
    });
}));