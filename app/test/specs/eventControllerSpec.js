'use strict';

(describe('Test EventController', function() {

  var eventCtrl, scope, httpBackend, rootScope, deffered, imageService, eventService, 
    postService, messageService;

  var splab = {name: 'Splab', key: '098745'};

  var date_now = new Date();

  var user = {
      name: 'User',
      institutions: [splab],
      follows: splab,
      institutions_admin: splab,
      current_institution: splab,
      key: '123'
  };  

  // Event of SPLAB by User
  var event = {
    'title': 'Title',
    'text': 'Text',
    'local': 'Local',
    'photo_url': null,
    'start_time': date_now, 
    'end_time': date_now,
  };

  var post = new Post({}, splab.key);
  post.shared_event = event.key;

  var event_convert_date = new Event(event, splab.key);

  beforeEach(module('app'));

  beforeEach(inject(function($controller, $httpBackend, $http, $q, AuthService, 
        $rootScope, ImageService, EventService, PostService, MessageService) {
      imageService = ImageService;
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      deffered = $q.defer();
      eventService = EventService;
      postService = PostService;
      messageService = MessageService;
      AuthService.login(user);
      eventCtrl = $controller('EventController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            eventService: eventService,
            postService : postService,
            messageService : messageService
        });
      eventCtrl.event = event;
      eventCtrl.events = [];

      httpBackend.when('GET', "/api/events").respond([]);
      httpBackend.when('GET', 'main/main.html').respond(200);
      httpBackend.when('GET', 'home/home.html').respond(200);
      httpBackend.when('GET', 'auth/login.html').respond(200);
      httpBackend.flush();
  }));

  afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
  });

  describe('share()', function() {

    it('should eventService.createPost be called', function() {
      spyOn(postService, 'createPost').and.returnValue(deffered.promise);
      deffered.resolve(post);
      eventCtrl.share(event);
      scope.$apply();
      expect(postService.createPost).toHaveBeenCalledWith(post);
    });
  });

  describe('recognizeUrl()', function() {

    it('Should returns a event with https url in text', function() {
      eventCtrl.event.text = "Access: http://www.google.com";
      eventCtrl.event.text = eventCtrl.recognizeUrl(eventCtrl.event.text);
      expect(eventCtrl.event.text)
        .toEqual("Access: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
    });
  });

  describe('isLongText()', function() {

    it('Should be false', function() {
      expect(eventCtrl.isLongText(eventCtrl.event.text)).toBe(false);
    });

    it('Should be true', function() {
      eventCtrl.event.text = "Access: www.google.com aAt vero et accusamus et iusto odio dignis\
                  simos ducimus quiblanditiis praesentium voluptatum deleniti atque corr\
                  pti quos dolores et quas molestias excepturi sint occaecati cupiditate\
                  non provident, similique sunt in culpa qui officia deserunt mollitia"
      expect(eventCtrl.isLongText(eventCtrl.event.text)).toBe(true);
    });
  });
}));