'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteService", function InviteService($q, HttpService, AuthService) {
        var service = this;

        var INVITES_URI = "/api/invites";
    
        service.getInvite = function(inviteKey) {
            return HttpService.get(INVITES_URI + '/' + inviteKey);
        };

        service.sendInvite = function sendInvite(invite) {
            return HttpService.post(INVITES_URI, { data: invite });
        };


        service.acceptInviteUserAdm = function acceptInviteUserAdm(inviteKey) {
            return HttpService.put(INVITES_URI + '/' + inviteKey + '/institution_adm');
        };

        service.rejectInviteUserAdm = function rejectInviteUserAdm(inviteKey) {
            return HttpService.delete(INVITES_URI + '/' + inviteKey + '/institution_adm');
        };

        service.resendInvite = function resendInvite(inviteKey) {
            return HttpService.post(INVITES_URI + "/" + inviteKey + "/resend", {});
        };

        service.sendInviteInst = function sendInviteInst(invite) {
            return HttpService.post(INVITES_URI + '/institution', { data: invite });
        };

        service.deleteUserInvite = function deleteUserInvite(inviteKey) {
            var url = `${INVITES_URI}/user/${inviteKey}`;
            return HttpService.delete(url);
        };

        service.deleteInstitutionInvite = function deleteInstitutionInvite(inviteKey) {
            var url = `${INVITES_URI}/institution/${inviteKey}`;
            return HttpService.delete(url);
        };
        

        service.getSentInstitutionInvitations = function getSentInstitutionInvitations() {
            return HttpService.get(INVITES_URI + '/institution');
        };

        service.acceptUserInvite = function acceptUserInvite(patch, invite_key) {
            var url = `${INVITES_URI}/user/${invite_key}`;
            return HttpService.patch(url, patch);
        };

        service.sendInviteHierarchy = function sendInviteHierarchy(invite) {
            return HttpService.post(INVITES_URI + '/institution_hierarchy', { data: invite });
        };

        service.sendInviteUser = function sendInvite(invite) {
            return HttpService.post(INVITES_URI + '/user', { data: invite });
        };
    });
})();