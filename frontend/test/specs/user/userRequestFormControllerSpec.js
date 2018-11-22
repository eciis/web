'use strict';

(describe('Test UserRequestFormController', function() {

    let userReqFormCtrl, messageService, state, scope, deferred;
    let authService, requestInvitationService;

    const institution = {
        name: 'institution',
        key: 'inst-key',
        id: 'inst-key',
        admin: {key: 'admin-key'}
    };

    const user = {
        name: 'User',
        key: 'user-key',
        email: 'user@email',
        state: 'active'
    };

    const request = { 
        status: 'sent',
        sender_key: 'some-key'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, $state,
         AuthService, RequestInvitationService, MessageService, $q) {

        scope = $rootScope.$new();
        state = $state;
        messageService = MessageService;
        requestInvitationService = RequestInvitationService;
        authService = AuthService;
        deferred = $q.defer();

        AuthService.login(user);

        userReqFormCtrl = $controller('UserRequestFormController', {
            $scope: scope     
        });
        
        userReqFormCtrl.selectedInst = {...institution};
    }));

    fdescribe('UserRequestFormController functions', function() {

        describe('getMesage()', function () {
            const formMsg = "Para finalizar o pedido de convite, preencha suas informações institucionais";
            const requestSentMsg = `Sua solicitação de convite foi enviada e esta em analise pelo administrador
             de sua instituição na plataforma e-CIS. Voce recebera a confirmação em seu e-mail.`

            it('should return the form message when the was not sent yet', function () {
                userReqFormCtrl.isRequestSent = false;
                expect(userReqFormCtrl.getMessage()).toEqual(formMsg);
            });

            it('should return the request sent message when the was already sent', function () {
                userReqFormCtrl.isRequestSent = true;
                expect(userReqFormCtrl.getMessage()).toEqual(requestSentMsg);
            });
        });

        describe('sendRequest()', function () {
            let request = {};

            beforeEach(function () {
                userReqFormCtrl.request = {
                    office: 'some office',
                    email: 'email'
                };
                request = new Invite({
                    institution_key : userReqFormCtrl.selectedInst.key,
                    sender_key : userReqFormCtrl.user.key,
                    admin_key : userReqFormCtrl.selectedInst.admin.key,
                    is_request : true,
                    type_of_invite : 'REQUEST_USER',
                    sender_name : userReqFormCtrl.user.name,
                    office : userReqFormCtrl.request.office,
                    institutional_email : userReqFormCtrl.request.email
                });
                spyOn(requestInvitationService, 'sendRequest').and.returnValue(deferred.promise);
            })

            it('should call RequestInvitationService.sendRequest', function () {
                expect(userReqFormCtrl.isRequestSent).toBeFalsy();
                deferred.resolve();
                userReqFormCtrl.sendRequest();
                scope.$apply();
                expect(requestInvitationService.sendRequest).toHaveBeenCalledWith(request, userReqFormCtrl.selectedInst.key);
                expect(userReqFormCtrl.isRequestSent).toBeTruthy();
            });

            it('should show an error message when the request fails', function () {
                expect(userReqFormCtrl.isRequestSent).toBeFalsy();
                spyOn(messageService, 'showToast');
                deferred.reject();
                userReqFormCtrl.sendRequest();
                scope.$apply();
                const msg = "Um erro ocorreu. Verifique as informações e tente novamente";
                expect(messageService.showToast).toHaveBeenCalledWith(msg)
                expect(userReqFormCtrl.isRequestSent).toBeFalsy();
            });
        });

        describe('onClick()', function () {
            it('should call the logout function when the request was already sent', function () {
                spyOn(authService, 'logout');
                userReqFormCtrl.isRequestSent = true;
                userReqFormCtrl.onClick();
                expect(authService.logout).toHaveBeenCalled();
            });

            it('should logout function when the request was not sent yet', function () {
                spyOn(userReqFormCtrl, '_verifyAndSendRequest');
                userReqFormCtrl.isRequestSent = false;
                userReqFormCtrl.onClick();
                expect(userReqFormCtrl._verifyAndSendRequest).toHaveBeenCalled();
            });
        });

        describe('getBtnTitle()', function () {
            it(`should return the button title 'Início'
                when the request was already sent`, function () {
                userReqFormCtrl.isRequestSent = true;
                expect(userReqFormCtrl.getBtnTitle()).toBe('Início');
            });

            it(`should return the button title 'Finalizar'
                when the request was not sent yet`, function () {
                userReqFormCtrl.isRequestSent = false;
                expect(userReqFormCtrl.getBtnTitle()).toBe('Finalizar');
            });
        });

        describe('goBack()', function () {
            it('should return to the user_inactive state', function () {
                spyOn(state, 'go');
                userReqFormCtrl.goBack();
                expect(state.go).toHaveBeenCalledWith('user_inactive');
            });
        });

        describe('_verifyAndSendRequest()', function () {
            it(`should show a message when the institution
                has already been requested by the user`, function () {
                spyOn(userReqFormCtrl, '_wasInstRequested').and.returnValue(true);
                spyOn(messageService, 'showToast');
                userReqFormCtrl._verifyAndSendRequest();
                const msg = "Você já solicitou para fazer parte dessa instituição.";
                expect(messageService.showToast).toHaveBeenCalledWith(msg)
            });

            it(`should send the request when the institution
                has not been requested by the user`, function () {
                spyOn(userReqFormCtrl, '_wasInstRequested').and.returnValue(false);
                spyOn(userReqFormCtrl, 'sendRequest');
                userReqFormCtrl._verifyAndSendRequest();
                expect( userReqFormCtrl.sendRequest).toHaveBeenCalled();
            });
        });

        describe('_wasInstRequested()', function () {
            it('should be true when the user has already requested the institution', function () {
                userReqFormCtrl.requests = [
                    {...request}, 
                    {...request, sender_key: user.key}
                ];
                expect(userReqFormCtrl._wasInstRequested()).toBeTruthy();
            });

            it('should be false when the user has not requested the institution yet', function () {
                userReqFormCtrl.requests = [
                    {...request}, 
                    {...request}
                ];
                expect(userReqFormCtrl._wasInstRequested()).toBeFalsy();
            });
        });

        describe('_loadRequests()', function () {
            it(`should call RequestInvitationService.getRequests
                when the selected Institution is loaded`, function () {
                userReqFormCtrl.selectedInst = institution;
                const requests = [{...request}, {...request}];
                spyOn(requestInvitationService, 'getRequests').and.returnValue(deferred.promise);
                deferred.resolve(requests);
                userReqFormCtrl._loadRequests();
                scope.$apply();
                expect(requestInvitationService.getRequests).toHaveBeenCalledWith(institution.key);
                expect(userReqFormCtrl.requests).toEqual(requests);
            });

            it(`should not call RequestInvitationService.getRequests
                when the selected Institution is not loaded`, function () {
                userReqFormCtrl.selectedInst = undefined;
                spyOn(requestInvitationService, 'getRequests');
                userReqFormCtrl._loadRequests();
                expect(requestInvitationService.getRequests).not.toHaveBeenCalled();
                expect(userReqFormCtrl.requests).toEqual([]);
            });
        })
    });
}));