'use strict';

(describe('Test InviteService', function () {
        var httpBackend, service, $http;
        var INVITES_URI = "/api/invites";

        var inviteUser = {institution_key: "098745", type_of_invite: "user", invitee: "mayzabeel@gmail.com"};
        var inviteInstitution = {institution_key: "098745", type_of_invite: "institution", suggestion_institution_name: "New Institution", invitee: "mayzabeel@gmail.com"};

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, InviteService, _$http_) {
            httpBackend = $httpBackend;
            $http = _$http_;
            service = InviteService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200); 
        }));

        it('Test sendInvite user in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', INVITES_URI).respond(inviteUser);
            var result;
            service.sendInvite(inviteUser).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalledWith(INVITES_URI, inviteUser);
            expect(result.data).toEqual(inviteUser);
        });

        it('Test sendInvite institution in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', INVITES_URI).respond(inviteInstitution);
            var result;
            service.sendInvite(inviteInstitution).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalledWith(INVITES_URI, inviteInstitution);
            expect(result.data).toEqual(inviteInstitution);
        });
}));