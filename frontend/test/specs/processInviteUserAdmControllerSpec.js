'use strict';

(describe('Test ProcessInviteUserAdmController', function() {
    beforeEach(module('app'));

    var user, invite;

    var institution = {
        key: "institutuion_key",
        admin: user,
        members: [user],
        name: 'institution'
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
            institutions: [{key: "institutuion_key"}],
            state: 'active',
            key: '3242343rdsf324s',
            permissions: []
        };

        invite = {
            status: 'sent',
            key: '437829dshsjka',
            institution_key: institution.key,
            institution : institution
        };

        AuthService.login(user);

        spyOn(InviteService, 'getInvite').and.callFake(function() {
            return {
                then: function(callback) {
                    callback(invite);
                }
            };
        });

        processInviteUserAdmCtrl = $controller('ProcessInviteUserAdmController', {
            request: invite,
            typeOfDialog: 'ACCEPT_INVITATION',
            InviteService: inviteService,
            MessageService: messageService,
            AuthService: authService,
            $mdDialog: mdDialog
        });
    }));

    describe('Test view accept invite', function() {
        
        beforeEach(function() {
            processInviteUserAdmCtrl.invite.institution.trusted = true;
            let permission_inst = _.set({}, processInviteUserAdmCtrl.invite.institution.key, true);
            processInviteUserAdmCtrl.current_user.permissions['analyze_request_inst'] = permission_inst;
            processInviteUserAdmCtrl.current_user.permissions['send_invite_inst'] = permission_inst;

            processInviteUserAdmCtrl.invite.status= "accepted";

            processInviteUserAdmCtrl = controller('ProcessInviteUserAdmController', {
                request: invite,
                typeOfDialog: 'VIEW_ACCEPTED_INVITATION_SENDER',
                InviteService: inviteService,
                MessageService: messageService,
                AuthService: authService,
                $mdDialog: mdDialog
            });
        });

        it('Should remove super user permissions of old admin', function() {
            expect(processInviteUserAdmCtrl.current_user.hasPermission('analyze_request_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('send_invite_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();

        });

    });


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
            expect(user.institutions[0].admin).toEqual(user.key);
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('VIEW_ACCEPTED_INVITATION_INVITEE');
            expect(processInviteUserAdmCtrl.isAccepting).toBeTruthy();
            expect(inviteService.acceptInviteUserAdm).toHaveBeenCalledWith(invite.key);
            expect(messageService.showToast).toHaveBeenCalledWith('Convite aceito com sucesso!');
        });

        it('Should add super user permissions of old admin', function() {
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('ACCEPT_INVITATION');
            expect(processInviteUserAdmCtrl.isAccepting).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('analyze_request_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('send_invite_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            
            processInviteUserAdmCtrl.invite.institution.trusted = true;
            processInviteUserAdmCtrl.accept();
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([institution.key]);
            expect(user.institutions[0].admin).toEqual(user.key);
            expect(processInviteUserAdmCtrl.current_user.hasPermission('analyze_request_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeTruthy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('send_invite_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeTruthy();
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('VIEW_ACCEPTED_INVITATION_INVITEE');
            expect(processInviteUserAdmCtrl.isAccepting).toBeTruthy();
            expect(inviteService.acceptInviteUserAdm).toHaveBeenCalledWith(invite.key);
            expect(messageService.showToast).toHaveBeenCalledWith('Convite aceito com sucesso!');
        });

        it('Should not add super user permissions of old admin', function() {
            expect(processInviteUserAdmCtrl.typeOfDialog).toEqual('ACCEPT_INVITATION');
            expect(processInviteUserAdmCtrl.isAccepting).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('analyze_request_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('send_invite_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            
            processInviteUserAdmCtrl.invite.institution.trusted = false;
            processInviteUserAdmCtrl.accept();
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([institution.key]);
            expect(user.institutions[0].admin).toEqual(user.key);
            expect(processInviteUserAdmCtrl.current_user.hasPermission('analyze_request_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
            expect(processInviteUserAdmCtrl.current_user.hasPermission('send_invite_inst', 
                processInviteUserAdmCtrl.invite.institution.key)).toBeFalsy();
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

        it('Should remove the institution from the list of institutions that user administer.', function() {
            user.institutions_admin = [institution.key];
            authService.login(user);
            user = JSON.parse(window.localStorage.userInfo);

            expect(user.institutions_admin).toEqual([institution.key]);

            controller('ProcessInviteUserAdmController', {
                request: invite,
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