'use strict';

(describe('Test PushNotificationService', function () {
    let service, messaging, defaultToken, notificationsRef, messageService, scope, $qMock, authService;

    const fakeCallback = function fakeCallback(data) {
        return {
            then: function (callback) {
                return callback(data);
            }
        };
    };

    const TOKEN_OBJECT = {token: 'token'};

    beforeEach(module('app'));

    beforeEach(inject(function (PushNotificationService, MessageService, $q, $rootScope, AuthService) {
        service = PushNotificationService;
        messaging = firebase.messaging();
        messageService = MessageService;
        var ref = firebase.database().ref();
        notificationsRef = ref.child("notifications/key");
        defaultToken = 'oaspkd-OPASKDAPO';
        scope = $rootScope.$new();
        $qMock = $q;
        authService = AuthService;

        spyOn(authService, 'getCurrentUser').and.callFake(() => new User({
            key: 'aopskdpoaAPOSDKAPOKDPK'
        }));
    }));

    describe('setupPushNotificationPermission', () => {
        it('should call _initFirebaseArray', () => {
            spyOn(service, '_initFirebaseArray');
            service.setupPushNotificationPermission();
            expect(service._initFirebaseArray).toHaveBeenCalled();
        });
    });

    describe('isPushNotificationBlockedOnBrowser', () => {
        it('should return true when the user has blocked notifications', () => {
            Notification = {permission: 'denied'};

            const result = service.isPushNotificationBlockedOnBrowser();

            expect(result).toEqual(true);
        });

        it('should return false when the user has not blocked notifications', () => {
            Notification = {permission: 'ask'};

            const result = service.isPushNotificationBlockedOnBrowser();

            expect(result).toEqual(false);
        });
    });

    describe('isPushNotificationActive', () => {
        it('should return true if the browser token is included in the firebaseArray', () => {
            spyOn(service, '_getTokenObjectInFirebaseArray').and.callFake(() => $qMock.when(TOKEN_OBJECT));
            let result;
            service.isPushNotificationActive().then((isActive) => {
                result = isActive;
            });
            scope.$apply();
            expect(service._getTokenObjectInFirebaseArray).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false if the browser token is not included in the firebaseArray', () => {
            spyOn(service, '_getTokenObjectInFirebaseArray').and.callFake(() => $qMock.when());

            let result;
            service.isPushNotificationActive().then((isActive) => {
                result = isActive;
            });
            scope.$apply();
            expect(service._getTokenObjectInFirebaseArray).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('unsubscribeUserNotification', () => {
        it('should call _removeTokenFromFirebaseArray', () => {
            spyOn(service, '_removeTokenFromFirebaseArray');
            service.unsubscribeUserNotification();
            expect(service._removeTokenFromFirebaseArray).toHaveBeenCalled();
        });
    });

    describe('_removeTokenFromFirebaseArray', () => {
        it('should call _getTokenObjectInFirebaseArray and remove object from firebase array', () => {
            service._initFirebaseArray();
            spyOn(service, '_getTokenObjectInFirebaseArray').and.callFake(() => $qMock.when(TOKEN_OBJECT));
            spyOn(service.firebaseArrayNotifications, '$remove');
            service.unsubscribeUserNotification();
            scope.$apply();
            expect(service._getTokenObjectInFirebaseArray).toHaveBeenCalled();
            expect(service.firebaseArrayNotifications.$remove).toHaveBeenCalledWith(TOKEN_OBJECT);
        });
    });

    describe('subscribeUserNotification', () => {
        it('should call _requestNotificationPermission', () => {
            spyOn(service, '_requestNotificationPermission');
            service.subscribeUserNotification();
            expect(service._requestNotificationPermission).toHaveBeenCalled();
        });
    });

    describe('_requestNotificationPermission', () => {
        beforeEach(() => {
            spyOn(service, 'isPushNotificationBlockedOnBrowser').and.returnValue(false);
            spyOn(messaging, 'requestPermission');
            spyOn(messaging, 'getToken');
            spyOn(service, '_saveToken');
        });

        it('should call saveToken', () => {
            messaging.requestPermission.and.callFake(() => $qMock.when());
            messaging.getToken.and.callFake(fakeCallback);
            service._saveToken.and.callFake(fakeCallback);

            service._requestNotificationPermission();
            scope.$digest();

            expect(messaging.requestPermission).toHaveBeenCalled();
            expect(messaging.getToken).toHaveBeenCalled();  
            expect(service._saveToken).toHaveBeenCalled();
        });

        it('should not call saveToken when the user does not enable notification', () => {
            messaging.requestPermission.and.callFake(() => $qMock.reject());

            service._requestNotificationPermission();
            scope.$digest();

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

    describe('_initFirebaseArray', () => {
        it('should starts a firebaseArray', () => {
            expect(service.firebaseArrayNotifications).toBe(undefined);
            service._initFirebaseArray();

            expect(service.firebaseArrayNotifications).not.toBe(undefined);
        });
    });

    describe('_setToken', () => {
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

    describe('_getTokenObjectInFirebaseArray', () => {
        it('should return the object token corresponding to the messaging token', () => {
            service._initFirebaseArray();
            spyOn(service.firebaseArrayNotifications, '$loaded').and.callFake(() => $qMock.when([TOKEN_OBJECT]));
            spyOn(messaging, 'getToken').and.callFake(() => $qMock.when(TOKEN_OBJECT.token));

            let tokenObject;
            service._getTokenObjectInFirebaseArray().then((result) => {
                tokenObject = result;
            });
            scope.$apply();

            expect(tokenObject).toBe(TOKEN_OBJECT);
            expect(messaging.getToken).toHaveBeenCalled();
            expect(service.firebaseArrayNotifications.$loaded).toHaveBeenCalled();
        });
    });
}));