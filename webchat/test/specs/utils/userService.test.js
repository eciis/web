'use strict';

(describe('Test UserService', function () {
  let httpBackend, service, $http;

  const USER_URI = "/api/user";

  const user = {
    name: 'User',
    key: '12345',
    state: 'active',
    profile: {
      'institutional_email': 'user@ccc.ufcg.edu.br',
      'office': 'developer'
    }
  };

  const institution = {
    name: 'Splab',
    key: '098745',
    followers: [user.key],
    members: [user.key]
  };

  user.current_institution = institution;
  user.follows = [institution.key];
  user.institutions = [institution.key];

  beforeEach(module('webchat'));

  beforeEach(inject(function ($httpBackend, UserService, HttpService) {
    httpBackend = $httpBackend;
    $http = HttpService;
    service = UserService;
    httpBackend.when('GET', 'main/main.html').respond(200);
    httpBackend.when('GET', 'home/home.html').respond(200);
    httpBackend.when('GET', 'error/error.html').respond(200);
    httpBackend.when('GET', 'auth/login.html').respond(200);
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('Test UserService functions', function () {

    it('getUser()', function () {
      spyOn($http, 'get').and.callThrough();
      httpBackend.expect('GET', USER_URI + "/" + user.key + "/profile").respond(user.profile);
      let result;
      service.getUser(user.key).then(data => result = data);
      httpBackend.flush();
      expect($http.get).toHaveBeenCalledWith(USER_URI + "/" + user.key + "/profile");
      expect(result).toEqual(user.profile);
    });

    it('load()', function () {
      let result;
      service.load().then(function (data) {
        result = data;
      });
      expect(result).toEqual({ name: 'User' });
    });
  });
}));
