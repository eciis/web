'use strict';

(describe('Test NotificationController', function() {

    var notCtrl, httpBackend, scope, createCtrl, state, notificationService
    var authService, notificationListenerService, http;

    var EVENTS_TO_UPDATE_USER = ["DELETED_INSTITUTION", "DELETE_MEMBER", "ACCEPTED_LINK",
                                "ACCEPT_INSTITUTION_LINK", "TRANSFER_ADM_PERMISSIONS",
                                "ADD_ADM_PERMISSIONS", "ACCEPT_INVITE_INSTITUTION", "ACCEPT_INVITE_USER_ADM",
                                "REMOVE_INSTITUTION_LINK", "RE_ADD_ADM_PERMISSIONS"];
    
    var institution = {
        name: 'institution',
        key: '123456789'
    };

    var user = {
        name: 'user',
        institutions: [institution],
        current_institution: institution,
        follows: institution.key
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

    var surveyPostNotification = {
        id: 'abcde6789',
        status: 'READ',
        timestamp: new Date(),
        entity : entity,
        from : entity
    };

    institution.admin = user.key;
    postNotification.entity.entity_type = "POST";
    surveyPostNotification.entity.entity_type = "SURVEY_POST";

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, NotificationService,
            $state, AuthService, NotificationListenerService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        authService = AuthService;
        notificationService = NotificationService;
        notificationListenerService = NotificationListenerService;
        
        authService.login(user);

        createCtrl = function() {
            return $controller('NotificationController', {
                scope: scope
            });
        };
        notCtrl = createCtrl();
        notCtrl.notifications = [];
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('main()', function() {

        it("should call getAllNotifications.", function() {
            spyOn(notificationService, 'getAllNotifications').and.callThrough();
            spyOn(notificationService, 'watchNotifications').and.callThrough();

            notCtrl = createCtrl();

            expect(notificationService.getAllNotifications).toHaveBeenCalled();
            expect(notificationService.watchNotifications).toHaveBeenCalledWith(user.key, notCtrl.notifications);
            //The user don't have any notifications
            expect(_.isEmpty(notCtrl.notifications)).toBe(true);
        });

        it("should create observer", function() {
            spyOn(notificationListenerService, 'multipleEventsListener');

            notCtrl = createCtrl();
            expect(notificationListenerService.multipleEventsListener).toHaveBeenCalledWith(EVENTS_TO_UPDATE_USER, notCtrl.refreshUser);
        });
    });

    describe('numberUnreadNotifications()', function() {

        it("should be zero.", function() {
            expect(notCtrl.numberUnreadNotifications()).toEqual(0);
        });

        it("should be one.", function() {
            notificationService.firebaseArrayNotifications.push(postNotification);
            notCtrl.notifications.push(postNotification);

            expect(notCtrl.numberUnreadNotifications()).toEqual(1);
        });
    });

    describe('showNotifications()', function() {

        it("should redirect to notification page.", function() {
            spyOn(notCtrl, 'seeAll');
            notCtrl.showNotifications();
            expect(notCtrl.seeAll).toHaveBeenCalled();
        });

        it("should open menu.", function() {
            notificationService.firebaseArrayNotifications.push(postNotification);
            notCtrl.notifications.push(postNotification);
            var mdMenu = {
                open : function(ev){}
            };

            spyOn(notCtrl, 'seeAll');
            spyOn(mdMenu, 'open');
            
            notCtrl.showNotifications(mdMenu, event);
            expect(mdMenu.open).toHaveBeenCalled();
            expect(notCtrl.seeAll).not.toHaveBeenCalled();
        });
    });

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
            // When this function is called the informations of notification has in own controller in the variable 'type_data'
            // and the type 'COMMENT' has a state to 'app.post'
            notCtrl.goTo(notificationWithState);
            expect(state.go).toHaveBeenCalledWith(COMMENT_STATE, {key: notificationWithState.entity.key});
        });

        it('should call notCtrl.seeAll when notification no has a state', function() {
            spyOn(notCtrl, 'seeAll');

            var notificationWithoutState = {
                entity_type: 'REMOVE_INSTITUTION_LINK'
            };
            // When this function is called the informations of notification has in own controller in the variable 'type_data'
            // and the type 'REMOVE_INSTITUTION_LINK' no has a state to go
            notCtrl.goTo(notificationWithoutState);
            expect(notCtrl.seeAll).toHaveBeenCalled();
        });
    });

    describe('Main Controller listenners', function(){
        it("Should call userService load when event 'DELETED_INSTITUTION' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            spyOn(notCtrl, 'refreshUser').and.callThrough();

            scope.$emit("DELETED_INSTITUTION", {});
            expect(authService.reload).toHaveBeenCalled();
            expect(notCtrl.refreshUser).not.toHaveBeenCalled();
        });

        it("Should call userService load when event 'DELETE_MEMBER' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            spyOn(notCtrl, 'refreshUser').and.callThrough();

            scope.$emit("DELETE_MEMBER", {});
            expect(authService.reload).toHaveBeenCalled();
            expect(notCtrl.refreshUser).not.toHaveBeenCalled();
        });

        it("Should call userService load when event 'ACCEPT_INSTITUTION_LINK' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            spyOn(notCtrl, 'refreshUser').and.callThrough();

            scope.$emit("ACCEPT_INSTITUTION_LINK", {});
            expect(authService.reload).toHaveBeenCalled();
            expect(notCtrl.refreshUser).not.toHaveBeenCalled();
        });

        it("Should NOT call userService load when event 'EVENT' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            spyOn(notCtrl, 'refreshUser').and.callThrough();

            scope.$emit("EVENT", {});
            expect(authService.reload).not.toHaveBeenCalled();
            expect(notCtrl.refreshUser).not.toHaveBeenCalled();
        });
    });
}));