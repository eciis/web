'use strict';

(describe('Test InviteService', function () {
        var httpBackend, service, $http;
        var INVITES_URI = "/api/invites";

        var inviteUser = {institution_key: "098745", type_of_invite: "user", invitee: "mayzabeel@gmail.com"};
        var inviteInstitution = {institution_key: "098745", type_of_invite: "institution", suggestion_institution_name: "New Institution", invitee: "mayzabeel@gmail.com"};
        var invites = [inviteInstitution];
        var body = {
            data: null
        };

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, InviteService, _$http_) {
            httpBackend = $httpBackend;
            $http = _$http_;
            service = InviteService;
            service.user = {
                name: 'user',
                current_institution: {
                    name: "currentInstitution"
                }
            };
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
            httpBackend.when('GET', 'auth/login.html').respond(200);
        }));

        it('Test sendInvite user in success case', function(done) {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', INVITES_URI).respond(inviteUser);
            var result;
            service.sendInvite({invite_body: inviteUser}).then(function(data){
                result = data;
                body['data'] = {invite_body: inviteUser};
                expect($http.post).toHaveBeenCalledWith(INVITES_URI, body);
                expect(result.data).toEqual(inviteUser);
                done();
            });
            httpBackend.flush();
        });

        it('Test sendInvite institution in success case', function(done) {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', INVITES_URI).respond(inviteInstitution);
            var result;
            service.sendInvite(inviteInstitution).then(function(data){
                result = data;
                body['data'] = inviteInstitution;
                expect($http.post).toHaveBeenCalledWith(INVITES_URI, {data: inviteInstitution});
                expect(result.data).toEqual(inviteInstitution);
                done();
            });
            httpBackend.flush();
        });

        it('Test getSentInstitutionInvitations in success case', function(done) {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', INVITES_URI).respond(invites);
            var result;
            service.getSentInstitutionInvitations().then(function(data){
                result = data;
                expect($http.get).toHaveBeenCalled();
                expect(result.data).toEqual(invites);
                done();
            });
            httpBackend.flush();
           
        });
}));