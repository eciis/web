'use strict';

(describe('Test RequestProcessingController', function() {

    beforeEach(module('app'));

    var request = {
        key: '498753874398579843',
        status: 'sent',
        type_of_invite: 'USER'
    };

    var user = {
        key: '3242343rdsf324s',
        permissions: []
    };

    var permissions = [
        {'update_inst': {
            'jkdhsfjksd': true
            }
        }
    ];

    var requestProcessingCtrl, authService, requestInvitationService, userService, messageService;

    beforeEach(inject(function($controller, AuthService, RequestInvitationService, UserService, MessageService) {
        authService = AuthService;
        requestInvitationService = RequestInvitationService;
        userService = UserService;
        messageService = MessageService;
        AuthService.login(user);

        spyOn(RequestInvitationService, 'getRequest').and.callFake(function() {
            return {
                then: function(callback) {
                    callback(request);
                }
            };
        });

        spyOn(MessageService, 'showToast').and.callFake(function() {});

        requestProcessingCtrl = $controller('RequestProcessingController', {
            AuthService: authService,
            UserService: UserService,
            key: request.key,
            RequestInvitationService: requestInvitationService
        });
    }));

    describe('Test acceptRequest', function() {
        beforeEach(function() {
            spyOn(userService, 'load').and.callFake(function() {
                return {
                    then: function(callback) {
                        callback({permissions: permissions});
                    }
                };
            }); 

            spyOn(requestInvitationService, 'acceptRequest').and.callFake(function(){
                return {
                    then: function(callback) {
                        callback();
                    }
                };
            });

            spyOn(requestProcessingCtrl, 'hideDialog').and.callFake(function() {});
        });

        it('Should accept request and refresh user permissions', function() {
            expect(authService.getCurrentUser().permissions).toEqual([]);
            expect(requestProcessingCtrl.request.status).toEqual('sent');

            requestProcessingCtrl.acceptRequest();

            expect(authService.getCurrentUser().permissions).toEqual(permissions);
            expect(messageService.showToast).toHaveBeenCalledWith("Solicitação aceita!");
            expect(requestProcessingCtrl.request.status).toEqual('accepted');
        });
    });
}));