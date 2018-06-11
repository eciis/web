'use strict';

(describe('Test NotificationController', function() {

    var notCtrl, httpBackend, scope, createCtrl, mdDialog, state, notificationService, http, authService;
    
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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, NotificationService,
            $mdDialog, $state, AuthService, $http) {
        httpBackend = $httpBackend;
        http = $http;
        scope = $rootScope.$new();
        mdDialog = $mdDialog;
        state = $state;
        authService = AuthService;
        notificationService = NotificationService;
        httpBackend.when('GET', 'app/user/user_inactive.html').respond(200);
        
        authService.login(user);

        createCtrl = function() {
            return $controller('NotificationController', {
                scope: scope
            });
        };
        notCtrl = createCtrl();
        notCtrl.notifications = [];
        httpBackend.flush();
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

            var notificationWithState = {
                entity_type: 'COMMENT',
                entity: {
                    key: '12345'
                }
            };

            notCtrl.goTo(notificationWithState);
            expect(state.go).toHaveBeenCalledWith('app.post', {key: notificationWithState.entity.key});
        });

        it('should call notCtrl.seeAll when notification no has a state', function() {
            spyOn(notCtrl, 'seeAll');

            var notificationWithoutState = {
                entity_type: 'REMOVE_INSTITUTION_LINK'
            };

            notCtrl.goTo(notificationWithoutState);
            expect(notCtrl.seeAll).toHaveBeenCalled();
        });
    });
}));