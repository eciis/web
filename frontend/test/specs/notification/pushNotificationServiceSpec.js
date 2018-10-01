'use strict';

(fdescribe('Test PushNotificationService', function () {
    var service, messaging, defaultToken, notificationsRef;

    const fakeCallback = function fakeCallback(data) {
        return {
            then: function (callback) {
                return callback(data);
            }
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(function ($firebaseArray, PushNotificationService, AuthService) {
        service = PushNotificationService;
        messaging = firebase.messaging();
        var ref = firebase.database().ref();
        AuthService.login(new User({key: 'opaksdapodkadpk'}));
        notificationsRef = ref.child("notifications/key");
        defaultToken = 'oaspkd-OPASKDAPO';
    }));

    describe('requestNotificationPermission', () => {
        it('should call saveToken', () => {
            spyOn(messaging, 'requestPermission').and.callFake(fakeCallback);
            spyOn(messaging, 'getToken').and.callFake(fakeCallback);
            spyOn(service, '_saveToken').and.callFake(fakeCallback);

            service._requestNotificationPermission();

            expect(messaging.requestPermission).toHaveBeenCalled();
            expect(messaging.getToken).toHaveBeenCalled();  
            expect(service._saveToken).toHaveBeenCalled();
        });

        it('should not call saveToken', () => {
            spyOn(messaging, 'requestPermission').and.callFake(function() {
                return {
                    then: function () {
                        return;
                    }
                }
            });
            spyOn(messaging, 'getToken');
            spyOn(service, '_saveToken');

            service._requestNotificationPermission();

            expect(messaging.requestPermission).toHaveBeenCalled();
            expect(messaging.getToken).not.toHaveBeenCalled();
            expect(service._saveToken).not.toHaveBeenCalled();

        });
    });

    describe('saveToken', () => {
        it('should initFirebaseArray and setToken', () => {
            spyOn(service, '_initFirebaseArray').and.returnValue(notificationsRef);
            spyOn(service, '_setToken');

            service._saveToken(defaultToken);

            expect(service._initFirebaseArray).toHaveBeenCalled();
            expect(service._setToken).toHaveBeenCalledWith(defaultToken, notificationsRef);
        });
    });

    describe('initFirebaseArray', () => {
        it('should starts a firebaseArray', () => {
            expect(service.firebaseArrayNotifications).toBe(undefined);

            service._initFirebaseArray();
            
            expect(service.firebaseArrayNotifications).not.toBe(undefined);
        });
    });

    describe('setToken', () => {
        beforeEach(() => {
            service._initFirebaseArray();
        });

        it('should call $add', () => {
            spyOn(service.firebaseArrayNotifications, '$loaded').and.callFake(fakeCallback);
            spyOn(service.firebaseArrayNotifications, '$add').and.callFake(fakeCallback);
            
            service._setToken(defaultToken, notificationsRef);

            expect(service.firebaseArrayNotifications.$loaded).toHaveBeenCalled();
            expect(service.firebaseArrayNotifications.$add).toHaveBeenCalled();
        });
    });

    describe('hasNotificationPermission', () => {
        it('should return true', () => {
            Notification = {permission: 'granted'};

            const result = service._hasNotificationPermission();

            expect(result).toBeTruthy();
        });

        it('should return false', () => {
            Notification = {permission: 'ask'};
            
            const result = service._hasNotificationPermission();

            expect(result).toBeFalsy();
        });
    });
}));