'use strict';

(describe('Test NotificationService', function () {
    var service, authService;

    var notification_to = {
        'entity_type' : 'REQUEST_INSTITUTION',
        'entity_key': '12',
        'status': 'NEW',
        'entity': {
            'key': '12'
        },
        'to':{
            'institution_name': 'inst_requested_name'
        },
        'from': {
            'institution_name': '',
            'name': 'user'
        }
    }

    var notification_from_to = {
        'entity_type': 'REQUEST_INSTITUTION_PARENT',
        'entity_key': '12',
        'status': 'NEW',
        'entity': {
            'key': '12'
        },
        'to':{
            'institution_name': 'inst_requested_name'
        },
        'from': {
            'institution_name': 'inst_name',
            'name': 'user'
        }
    };

    var notification_from = {
        'entity_type': 'COMMENT',
        'entity_key': '123',
        'entity': {
            'key' : '123'
        },
        'status': 'NEW',
        'from': {
            'institution_name': 'inst_name',
            'name': 'user'
        },
        'to':{
            'institution_name': ''
        }
    };

    var user_key = '123';

    var fakeCallback = function fakeCallback() {
        return {
            then: function (callback) {
                return callback();
            }
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService) {
        authService = AuthService;
        spyOn(AuthService, '$onLogout');
    }));

    beforeEach(inject(function(NotificationService, $firebaseArray) {
        service = NotificationService;
        var ref = firebase.database().ref();
        var notificationsRef = ref.child("notifications/key");
        service.firebaseArrayNotifications = $firebaseArray(notificationsRef)
        service.firebaseArrayNotifications.push(notification_from_to);
        service.firebaseArrayNotifications.push(notification_from);

        expect(authService.$onLogout).toHaveBeenCalled();
    }));

    describe('Test markAsRead', function(){
        it('Mark message as read.', function() {
            spyOn(service.firebaseArrayNotifications, '$save');
            service.markAsRead(notification_from);
            expect(service.firebaseArrayNotifications.$save).toHaveBeenCalledWith(notification_from);
            expect(notification_from.status).toEqual('READ');
        });
    });

    describe('Test watchNotifications', function(){
        beforeEach(function(){
            spyOn(service.firebaseArrayNotifications, '$loaded').and.callFake(fakeCallback);
        });

        describe('Test watchPostNotification', function(){
            it('Should call function of array notification.', function() {
                spyOn(service.firebaseArrayNotifications, '$watch');
                service.watchNotifications(user_key, fakeCallback);
                expect(service.firebaseArrayNotifications.$loaded).toHaveBeenCalled();
                expect(service.firebaseArrayNotifications.$watch).toHaveBeenCalled();
            });
        });
    });

    describe('Test watchPostNotification', function(){
        beforeEach(function(){
            spyOn(service.firebaseArrayNotifications, '$loaded').and.callFake(fakeCallback);
        });

        describe('Test watchPostNotification', function(){
            it('Should call function of array notification.', function() {
                spyOn(service.firebaseArrayNotifications, '$watch');
                service.watchPostNotification(user_key);
                expect(service.firebaseArrayNotifications.$loaded).toHaveBeenCalled();
                expect(service.firebaseArrayNotifications.$watch).toHaveBeenCalled();
            });

        });
    });

    describe('Test formatMessage', function(){
        it("Message of notification should be 'Comentou em um post de inst_name'", function() {
            expect(service.formatMessage(notification_from)).toEqual(
                'Comentou em um post de inst_name');
        });

        it("Message of notification should be" + 
            + "'Solicitou um novo vínculo entre inst_name e inst_requested_name'", function() {
            expect(service.formatMessage(notification_from_to)).toEqual(
                'Solicitou um novo vínculo entre inst_name e inst_requested_name');
        });

        it("Message of notification should be 'Deseja criar uma nova institutição'", function() {
            expect(service.formatMessage(notification_to)).toEqual(
                'Deseja criar uma nova institutição');
        });
    });
}));