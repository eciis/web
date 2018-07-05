'use strict';

(describe('Test SelectEmailsController', function() {

    var mdDialog, scope, state, newCtrl, selectEmailsCtrl, manageMemberCtrl;

    var user = {
         name: 'User',
         cpf: '121.445.044-07',
         key: '54321',
         email: 'user@example.com'
    };

    var emails = ["test1@example.com", "test2@example.com", "test3@example.com"];
    beforeEach(module('app'));

    beforeEach(inject(function($controller, $state, $rootScope, $mdDialog, AuthService) {
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        state = $state;
        newCtrl = $controller;
        AuthService.login(user);
        state.params.institutionKey = '123456789';
        manageMemberCtrl = newCtrl('ManagementMembersController');
        selectEmailsCtrl = newCtrl(
            'SelectEmailsController', {
                scope: scope,
            }, {
                emails: emails,
                removePendingAndMembersEmails: manageMemberCtrl.removePendingAndMembersEmails,
                sendUserInvite: manageMemberCtrl.sendUserInvite
            }
        );
    }));

    describe('SelectEmailsController properties', function() {

        it('Should exist 3 emails loaded by CSV file', function() {
            expect(selectEmailsCtrl.emails.length).toBe(3);
        });

        it('Should exist 0 emails in selectedEmails', function() {
            expect(selectEmailsCtrl.selectedEmails.length).toBe(0);
        });
    });

    describe('select()', function() {

        it('Should has test1@example.com in selectedEmails after call the select()', function() {
            expect(selectEmailsCtrl.selectedEmails).not.toContain("test1@example.com");
            selectEmailsCtrl.select(emails[0]);
            expect(selectEmailsCtrl.selectedEmails).toContain("test1@example.com");
        });

        it('Should remove test1@example.com from selectedEmails after call the select() to email already selected', function() {
            selectEmailsCtrl.selectedEmails = ["test1@example.com"];
            expect(selectEmailsCtrl.selectedEmails).toContain("test1@example.com");
            selectEmailsCtrl.select(emails[0]);
            expect(selectEmailsCtrl.selectedEmails).not.toContain("test1@example.com");
        });
    });

    describe('exists()', function() {

        it('Should return false if email has not been selected yet', function() {
            selectEmailsCtrl.selectedEmails = [];
            expect(selectEmailsCtrl.exists(emails[0])).toBeFalsy();
        });

        it('Should return true if email already been selected', function() {
            selectEmailsCtrl.select(emails[0]);
            expect(selectEmailsCtrl.exists(emails[0])).toBeTruthy();
        });
    });

    describe('selectAllEmails()', function() {

        it('Should has all emails from loaded CSV file in selectedEmails list after call the selectAllEmails()', function() {
            selectEmailsCtrl.selectedEmails = [];
            expect(selectEmailsCtrl.selectedEmails).toEqual([]);
            selectEmailsCtrl.selectAllEmails();
            expect(selectEmailsCtrl.selectedEmails).toEqual(emails);
        });

        it('Should remove all emails selected after call the selectAllEmails() when all emails already been selected', function() {
            selectEmailsCtrl.selectedEmails = emails;
            expect(selectEmailsCtrl.selectedEmails).toEqual(emails);
            selectEmailsCtrl.selectAllEmails();
            expect(selectEmailsCtrl.selectedEmails).toEqual([]);
        });
    });

    describe('isChecked()', function() {

        it('Should return true when all emails already been selected', function() {
            selectEmailsCtrl.selectAllEmails();
            expect(selectEmailsCtrl.isChecked()).toBeTruthy();
        });

        it('Should return false while all emails not been selected', function() {
            selectEmailsCtrl.selectedEmails = [];
            expect(selectEmailsCtrl.isChecked()).toBeFalsy();
        });
    });

    describe('closeDialog()', function() {

        it('Should call mdDialog.cancel()', function() {
            spyOn(mdDialog, 'cancel');
            selectEmailsCtrl.closeDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('Test sendInvite()', function() {
        it('Should call removePendingAndMembersEmails and sendUserInvite', function() {
            spyOn(selectEmailsCtrl, 'removePendingAndMembersEmails').and.callThrough();
            spyOn(selectEmailsCtrl, 'sendUserInvite');
            selectEmailsCtrl.selectAllEmails();
            selectEmailsCtrl.sendInvite();
            expect(selectEmailsCtrl.removePendingAndMembersEmails).toHaveBeenCalledWith(emails);
            expect(selectEmailsCtrl.sendUserInvite).toHaveBeenCalledWith(selectEmailsCtrl.selectedEmails);
        });
    });

    describe('validateEmail()', function() {

        it('Should return false if is a invalid email', function() {
            expect(selectEmailsCtrl.validateEmail("abcdefjh")).toBeFalsy();
        });

        it('Should return true if is a valid email', function() {
            expect(selectEmailsCtrl.validateEmail(emails[0])).toBeTruthy();
        });
    });
}));