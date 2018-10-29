'use strict';

(describe('notificationListComponent', function() {
    var state, ctrl;

    var institution = {
      name: 'institution',
      key: '123456789'
    };

    var entity = {
      institution_name : institution.name,
      key: institution.key
    }

    var postNotification = {
      id: 'abc1234',
      status: 'NEW',
      timestamp: new Date(),
      entity : entity,
      from : entity
    };
  
    beforeEach(module('notificationList'));
    beforeEach(inject(function(_$componentController_, $state) {
      state = $state;
      ctrl = _$componentController_('notificationList', null, null);
    }));
  
    it('should call state', function() {
      spyOn(state, 'go');  
      ctrl.goTo(postNotification);
      expect(state.go).toHaveBeenCalledWith('app.user.notifications');
    });
}));