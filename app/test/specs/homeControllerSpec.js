describe('Test HomeController', function() {
    var homeCtrl, rootScope, httpBackend;
    var user = {
        data: {
            name: 'Tiago'
        }
    };
    var institutions = {
        data: [{
            name: 'Certbio',
            key: '123456789'
        }]
    };
    var posts = {
        data: [{
        author: 'Mayza Nunes',
        author_key: "sad4s6d51cas65d48wq97easd",
        }]
    };
    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope) {
        httpBackend = $httpBackend;
        authRequest = httpBackend.when('GET', '/api/user').respond(user.data);
        institutionRequest = httpBackend.when('GET', '/api/institutions').respond(institutions.data);
        timelineRequest = httpBackend.when('GET', '/api/user/timeline').respond(posts.data);
        rootScope = $rootScope;
        homeCtrl = $controller('HomeController', {'$scope': rootScope});
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('Verify username', function() {
        console.log(homeCtrl.user);
        expect(homeCtrl.user.name).toEqual('Tiago');
    });

    it('Test the length of the posts array after initialize HomeController', function() {
        expect(homeCtrl.posts.length).toBe(1);
    });

    it('Test the content of posts array', function() {
        expect(homeCtrl.posts).toContain({author: 'Mayza Nunes', author_key: 'sad4s6d51cas65d48wq97easd'})
    });

    it('Test the length of the institutions array after initialize HomeController', function() { 
        expect(homeCtrl.institutions.length).toBe(1);
    });

    it('Verify the content of institutions array', function() {
        expect(homeCtrl.institutions).toContain({name: 'Certbio', key: '123456789'});
    });

    it('Tracks the spy for goToInstitution method and called with the correct arguments', function() {
        spyOn(homeCtrl, 'goToInstitution');
        homeCtrl.goToInstitution('123456789');
        expect(homeCtrl.goToInstitution).toHaveBeenCalled();
        expect(homeCtrl.goToInstitution).toHaveBeenCalledWith('123456789');
    });

    it('Tracks the spy for newPost method and called with the correct arguments', function() {
        spyOn(homeCtrl, 'newPost');
        homeCtrl.newPost('$event');
        expect(homeCtrl.newPost).toHaveBeenCalled();
        expect(homeCtrl.newPost).toHaveBeenCalledWith('$event');        
    });

    it('Tracks the spy for expandInstMenu method', function() {
        spyOn(homeCtrl, 'expandInstMenu').and.callThrough();
        expect(homeCtrl.instMenuExpanded).toBe(false);
        homeCtrl.expandInstMenu();
        expect(homeCtrl.expandInstMenu).toHaveBeenCalled();
        expect(homeCtrl.instMenuExpanded).toBe(true);
    });

    it('Tracks the spy for follow method and called with the correct arguments', function() {
        spyOn(homeCtrl, 'follow');
        homeCtrl.follow(splab);
        expect(homeCtrl.follow).toHaveBeenCalled();
        expect(homeCtrl.follow).toHaveBeenCalledWith(splab);
    });

    it('Tracks the spy for unfollow method and called with the correct arguments', function() {
        spyOn(homeCtrl, 'unfollow');
        homeCtrl.unfollow(splab);
        expect(homeCtrl.unfollow).toHaveBeenCalled();
        expect(homeCtrl.unfollow).toHaveBeenCalledWith(splab);
    });
});