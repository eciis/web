'use strict';

(describe('Test PostService', function () {
        var httpBackend, service, $http, scope;
        var POSTS_URI = "/api/posts";

        var user = {
            name: 'Raoni',
            key: 12345,
            state: 'active'
        };

        var login_user = {
            name: 'login_user',
            key: 12345,
            state: 'active'
        };

        var institutions = [
            {name: 'Splab',key: '098745', followers: [user], members: [user]},
            {name: 'e-CIS', key: '456879', followers: [user], members: [user]}
        ];

        user.follows = [institutions[0], institutions[1]];
        user.institutions = [institutions[0]];

        var posts = [
            {title: 'test', text: 'main post test', institution: institutions[0].key, key: '1'},
            {title: 'test2', text: 'secondary post test', institution: institutions[0].key, key: '2'},
            {title: 'test3', text: 'auxiliar post test', institution: institutions[1].key, key: '3'}
        ];

        institutions[0].posts = [posts[0], posts[1]];

        institutions[1].posts= [posts[2]];

        var like = {author: user.key, id: '012320'};

        posts[0].likes = [like];

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, PostService, _$http_, $rootScope, AuthService) {
            httpBackend = $httpBackend;
            $http = _$http_;
            scope = $rootScope.$new();
            service = PostService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
            httpBackend.when('GET', 'auth/login.html').respond(200);

            AuthService.login(login_user);
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('Test get in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', "/api/user/timeline").respond(posts);
            var result;
            service.get().then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(posts);
        });

        it('Test createPost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI).respond(posts[0]);
            var result;
            service.createPost(posts[0]).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalledWith(POSTS_URI, posts[0]);
            expect(result.data).toEqual(posts[0]);
        });

        it('Test likePost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            service.likePost(posts[0]);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Test dislikePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            service.dislikePost(posts[0]);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test deletePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            service.deletePost(posts[0]);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test getLikes in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/likes').respond(posts[0].likes);
            var result;
            service.getLikes(POSTS_URI + '/' + posts[0].key + '/likes').then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual([like]);
        });

        it('Test save()', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.when('PATCH', POSTS_URI + '/' + posts[0].key)
                                    .respond(200, {status: 200, msg: "success"});
            var patch = [{op: 'remove', path: 'propertie/1', value: 'test patch'}];
            var result;
            service.save(posts[0], patch).catch(function(data) {
                result = data;
            });
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
        });
}));