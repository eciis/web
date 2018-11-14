'use strict';

(describe('Test NotificationController', function() {

    var notCtrl, httpBackend, scope, createCtrl, state, notificationService
    var authService, http;
    
    var institution = {
        name: 'institution',
        key: '123456789'
    };

    var user = {
        name: 'user',
        key: 'keeey',
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
            $state, AuthService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        authService = AuthService;
        notificationService = NotificationService;
        
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
            spyOn(notificationService, 'getUnreadNotifications').and.callThrough();

            notCtrl = createCtrl();

            expect(notificationService.getAllNotifications).toHaveBeenCalled();
            expect(notificationService.getUnreadNotifications).toHaveBeenCalled();
            //The user don't have any notifications
            expect(_.isEmpty(notCtrl.notifications)).toBe(true);
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
}));