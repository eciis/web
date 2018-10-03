'use strict';

(describe('Test PushNotificationService', function () {
    var service, messaging, defaultToken, notificationsRef, messageService;

    const fakeCallback = function fakeCallback(data) {
        return {
            then: function (callback) {
                return callback(data);
            }
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(function (PushNotificationService, AuthService, MessageService) {
        service = PushNotificationService;
        messaging = firebase.messaging();
        messageService = MessageService;
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

        it('should call showToast', () => {
            spyOn(messaging, 'requestPermission').and.callFake(fakeCallback);
            spyOn(messaging, 'getToken').and.callFake(() => {
                return {
                    then: (success, error) => {
                        return error();
                    }
                }
            });
            spyOn(service, '_saveToken');
            spyOn(messageService, 'showToast');

            service._requestNotificationPermission();

            expect(messaging.requestPermission).toHaveBeenCalled();
            expect(messaging.getToken).toHaveBeenCalled();
            expect(service._saveToken).not.toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalledWith('Não foi possível ativar as notificações.');
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

            expect(result).toEqual(true);
        });

        it('should return false', () => {
            Notification = {permission: 'ask'};
            
            const result = service._hasNotificationPermission();

            expect(result).toEqual(false);
        });
    });
}));