'use strict';

(describe('Test ProcessInviteUserAdmController', function() {
    beforeEach(module('app'));

    var user, invite;

    var institution = {
        key: "institutuion_key",
        admin: user,
        members: [user]
    };

    var processInviteUserAdmCtrl, messageService, inviteService, mdDialog, authService, controller;

    beforeEach(inject(function($controller, MessageService, InviteService, $mdDialog, AuthService) {
        messageService = MessageService;
        inviteService = InviteService;
        mdDialog = $mdDialog;
        authService = AuthService;
        controller = $controller;

        user = {
            name: 'name',
            current_institution: {key: "institutuion_key"},
            email: ['user@email.com'],
            institutions_admin: [],
            state: 'active',
            key: '3242343rdsf324s'
        };

        invite = {
            status: 'sent',
            key: '437829dshsjka',
            institution_key: institution.key
        };

        AuthService.login(user);

        spyOn(InviteService, 'getInvite').and.callFake(function() {
            return {
                then: function(callback) {
                    callback({data: invite});
                }
            };
        });

        processInviteUserAdmCtrl = $controller('ProcessInviteUserAdmController', {
            key: invite.key,
            typeOfDialog: 'ACCEPT_INVITATION',
            InviteService: inviteService,
            MessageService: messageService,
            AuthService: authService,
            $mdDialog: mdDialog
        });
    }));

    describe('Test accept()', function() {
        
        beforeEach(function() {
            spyOn(inviteService, 'acceptInviteUserAdm').and.callFake(function() {
                return {
                    then: function(callback){
                        callback();
                    }
                };
            });

            spyOn(messageService, 'showToast').and.callFake(function(){});
        });

        it('Should accept the invitation to become an administrator', function() {
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('ACCEPT_INVITATION');
            expect(processInviteUserAdmCtrl.isAccepting).toBeFalsy();
            
            processInviteUserAdmCtrl.accept();
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([institution.key]);
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('VIEW_ACCEPTED_INVITATION_INVITEE');
            expect(processInviteUserAdmCtrl.isAccepting).toBeTruthy();
            expect(inviteService.acceptInviteUserAdm).toHaveBeenCalledWith(invite.key);
            expect(messageService.showToast).toHaveBeenCalledWith('Convite aceito com sucesso!');
        });
    });

    describe('Test reject()', function() {
        beforeEach(function() {
            spyOn(inviteService, 'rejectInviteUserAdm').and.callFake(function() {
                return {
                    then: function(callback){
                        callback();
                    }
                };
            });

            spyOn(messageService, 'showToast').and.callFake(function(){});
            spyOn(mdDialog, 'hide').and.callFake(function(){});
        });

        it('Should reject the invitation to become an administrator', function() {
            processInviteUserAdmCtrl.reject();
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([]);
            expect(messageService.showToast).toHaveBeenCalledWith('Convite recusado!');
            expect(inviteService.rejectInviteUserAdm).toHaveBeenCalledWith(invite.key);
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });

    describe('Test close()', function() {
        beforeEach(function() {
            spyOn(mdDialog, 'hide').and.callFake(function(){});
        });

        it('Should call mdDialog.hide', function() {
            processInviteUserAdmCtrl.close();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });

    describe('Test processed invite', function() {
        beforeEach(function() {
            spyOn(messageService, 'showToast').and.callFake(function(){});
            spyOn(mdDialog, 'hide').and.callFake(function(){});
        });

        it('Should return a message that the invitation has already been processed', function() {
            invite = {
                status: 'accepted',
                key: '437829dshsjka',
                institution_key: institution.key
            };

            controller('ProcessInviteUserAdmController', {
                key: invite.key,
                typeOfDialog: 'accept',
                InviteService: inviteService,
                MessageService: messageService,
                AuthService: authService,
                $mdDialog: mdDialog
            });

            expect(messageService.showToast).toHaveBeenCalledWith('Convite já processado!');
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('Should remove the institution from the list of institutions that user administer.', function() {
            invite = {
                status: 'accepted',
                key: '437829dshsjka',
                institution_key: institution.key,
                status: 'accepted'
            };

            user.institutions_admin = [institution.key];
            authService.login(user);
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([institution.key]);

            controller('ProcessInviteUserAdmController', {
                key: invite.key,
                typeOfDialog: 'VIEW_ACCEPTED_INVITATION_SENDER',
                InviteService: inviteService,
                MessageService: messageService,
                AuthService: authService,
                $mdDialog: mdDialog
            });

            user = JSON.parse(window.localStorage.userInfo);
            expect(user.institutions_admin).toEqual([]);
        });
    });
}));