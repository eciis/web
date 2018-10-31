'use strict';

(describe('notificationComponentController', function() {
    let state, notCtrl, requestDialogService, NOTIFICATIONS_TYPE;
    const event = "$event";

    const bindings = {'markAsRead': function(){}}

    beforeEach(module('app'));
    beforeEach(inject(function(_$componentController_, $state, RequestDialogService, NOTIFICATION_TYPE) {
      state = $state;
      requestDialogService = RequestDialogService;
      NOTIFICATIONS_TYPE = NOTIFICATION_TYPE;
      notCtrl = _$componentController_('notificationList', null, bindings);
    }));

    
    describe('goTo()', function() {

      it('should call state.go if notification has a state', function() {
          spyOn(state, 'go');

          const COMMENT_STATE = 'app.post';

          var notificationWithState = {
              entity_type: 'COMMENT',
              entity: {
                  key: '12345'
              }
          };
      
          notCtrl.goTo(notificationWithState);
          expect(state.go).toHaveBeenCalledWith(COMMENT_STATE, {key: notificationWithState.entity.key});
      });

      it('should go to app.user.notifications if notification has no state property', function() {
          spyOn(state, 'go');

          var notificationWithoutState = {
              entity_type: 'REMOVE_INSTITUTION_LINK'
          };
         
          notCtrl.goTo(notificationWithoutState);
          expect(state.go).toHaveBeenCalledWith("app.user.notifications");
      });
    });

    describe('action()', function() {
        beforeEach(function(){
            spyOn(requestDialogService, 'showRequestDialog');
            spyOn(notCtrl, 'markAsRead');
            spyOn(notCtrl, 'goTo');
        });

        it('should call action of notification if is defined', function() {
            var notification = {"entity_type" : "REQUEST_USER"};
            var properties = NOTIFICATIONS_TYPE.REQUEST_USER.properties;

            notCtrl.action(notification, event);
            expect(requestDialogService.showRequestDialog).toHaveBeenCalledWith(notification, event, properties);
            expect(notCtrl.markAsRead).toHaveBeenCalled();
            expect(notCtrl.goTo).not.toHaveBeenCalled();

        });

        it('should call goTo of controller without action', function() {
            var notification = {
                entity_type: 'DELETED_INSTITUTION'
            };
 
            notCtrl.action(notification, event);
            expect(notCtrl.goTo).toHaveBeenCalledWith(notification);
            expect(notCtrl.markAsRead).toHaveBeenCalled();
            expect(requestDialogService.showRequestDialog).not.toHaveBeenCalled();
        });
    });
}));