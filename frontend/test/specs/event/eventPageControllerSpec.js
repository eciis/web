'use strict';

(describe('Test EventPageController', function() {

  let eventCtrl, scope, httpBackend, rootScope, states, eventService, 
    postService, messageService, mdDialog, state;

  var institution = {name: 'institution', key: '098745'};
  var EVENTS_URI = '/api/events';

  var date_now = new Date();

  var user = {
      name: 'User',
      institutions: [institution],
      follows: institution,
      institutions_admin: institution,
      current_institution: institution,
      key: '123'
  };

  var user_not_admin = {
      name: 'User Not Admin',
      institutions: [institution],
      follows: institution,
      institutions_admin: undefined,
      current_institution: institution,
      key: '1234'
  };

  var user_admin = {
      name: 'User Admin',
      institutions: [institution],
      follows: institution,
      institutions_admin: institution,
      current_institution: institution,
      key: '1234'
  };      

  // Event of institution by User
  var event = {
    'title': 'Title',
    'text': 'Text',
    'local': 'Local',
    'photo_url': null,
    'start_time': date_now, 
    'end_time': date_now,
    'key': '123456',
    'author_key': user.key
  };

  var post = new Post({}, institution.key);
  post.shared_event = event.key;

  var event_convert_date = new Event(event, institution.key);
  var EVENT_URI = EVENTS_URI + '/' + event_convert_date.key;

  beforeEach(module('app'));

  beforeEach(inject(function($controller, $httpBackend, $http, $q, AuthService, $state,
        $rootScope, STATES, EventService, PostService, MessageService, $mdDialog) {
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      eventService = EventService;
      postService = PostService;
      messageService = MessageService;
      mdDialog = $mdDialog;
      AuthService.login(user);
      state = $state;
      states = STATES;
      state.params.eventKey = event_convert_date.key;
      eventCtrl = $controller('EventPageController', {
            scope: scope,
            $rootScope: rootScope,
            eventService: eventService,
            postService : postService,
            messageService : messageService,
            mdDialog: mdDialog,
            state: state
        });

      httpBackend.when('GET', EVENT_URI).respond(event_convert_date);
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
      spyOn(postService, 'createPost').and.callFake(function () {
        return {
          then: function (callback) {
            return callback({});
          }
        };
      });
      eventCtrl.share(event);
      expect(postService.createPost).toHaveBeenCalledWith(post);
    });
  });

  describe('recognizeUrl()', function() {

    it('Should returns a event with https url in text', function() {
      event_convert_date.text = "Access: http://www.google.com";
      event_convert_date.text = eventCtrl.recognizeUrl(event_convert_date.text);
      expect(event_convert_date.text)
        .toEqual("Access: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
    });
  });

  describe('canDelete()', function() {

    it('Should be false', function() {
      eventCtrl.user = user_not_admin;
      expect(eventCtrl.showButtonDelete()).toBe(false);
    });

    it('Should be true', function() {
      eventCtrl.user = user_admin;
      expect(eventCtrl.showButtonDelete()).toBe(true);
    });

    it('Should be true', function() {
      expect(eventCtrl.showButtonDelete()).toBe(true);
    });
  });

  describe('showButtonDelete()', function() {

    it('Should be false', function() {
      eventCtrl.user = user_not_admin;
      expect(eventCtrl.showButtonDelete()).toBe(false);
    });

    it('Should be false', function() {
      eventCtrl.event.state = 'deleted';
      expect(eventCtrl.showButtonDelete()).toBe(false);
    });

    it('Should be true', function() {
      eventCtrl.user = user_admin;
      expect(eventCtrl.showButtonDelete()).toBe(true);
    });

    it('Should be true', function() {
      expect(eventCtrl.showButtonDelete()).toBe(true);
    });
  });

  describe('showImage()', function() {

    it('Should be false', function() {
      expect(eventCtrl.showImage()).toBe(false);
    });

    it('Should be true', function() {
      eventCtrl.event.photo_url = 'image.jpeg';
      expect(eventCtrl.showImage()).toBe(true);
    });
  });

  describe('showButtonDelete()', function() {

    it('Should be false', function() {
      expect(eventCtrl.isDeleted()).toBe(false);
    });

    it('Should be true', function() {
      eventCtrl.event.state = 'deleted';
      expect(eventCtrl.isDeleted()).toBe(true);
    });
  });

  describe('goToInstitution()', function() {

    it('Should call state.go', function() {
      spyOn(state, 'go');
      eventCtrl.goToInstitution(institution.key);
      expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, Object({ institutionKey: institution.key }));
    });
  });
}));