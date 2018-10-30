'use strict';

(describe('notificationListComponent', function() {
    let state, notCtrl, requestDialogService;

    const bindings = {'markAsRead': function(){}}

    beforeEach(module('app'));
    beforeEach(inject(function(_$componentController_, $state, RequestDialogService) {
      state = $state;
      requestDialogService = RequestDialogService;
      notCtrl = _$componentController_('notificationList', null, bindings);
    }));

    
    describe('goTo()', function() {

      it('should call state.go if notification has a state', function() {
          spyOn(state, 'go');

          var COMMENT_STATE = 'app.post';

          var notificationWithState = {
              entity_type: 'COMMENT',
              entity: {
                  key: '12345'
              }
          };
      
          notCtrl.goTo(notificationWithState);
          expect(state.go).toHaveBeenCalledWith(COMMENT_STATE, {key: notificationWithState.entity.key});
      });

      it('should call notCtrl.seeAll when notification no has a state', function() {
          spyOn(state, 'go');

          var notificationWithoutState = {
              entity_type: 'REMOVE_INSTITUTION_LINK'
          };
         
          notCtrl.goTo(notificationWithoutState);
          expect(state.go).toHaveBeenCalledWith("app.user.notifications");
      });
    });

    describe('action()', function() {

        it('should call action of notification', function() {
            spyOn(requestDialogService, 'showRequestDialog');
            spyOn(notCtrl, 'markAsRead');
            var notification = {"entity_type" : "REQUEST_USER"};
            var properties = {
                "templateUrl": "app/requests/request_user_dialog.html",
                "controller": "RequestProcessingController",
                "controllerAs": "requestCtrl",
                "locals": {}
            };

            notCtrl.action(notification, "$event");
            expect(requestDialogService.showRequestDialog).toHaveBeenCalledWith(notification, "$event", properties);
            expect(notCtrl.markAsRead).toHaveBeenCalled();

        });

        it('should call goTo of controller without action', function() {
            spyOn(notCtrl, 'goTo');
            spyOn(notCtrl, 'markAsRead');
            var notification = {
                entity_type: 'DELETED_INSTITUTION'
            };
 
            notCtrl.action(notification, "$event");
            expect(notCtrl.goTo).toHaveBeenCalledWith(notification);
            expect(notCtrl.markAsRead).toHaveBeenCalled();
        });
    });
}));