'use strict';

(describe('Test EventController', function() {

  var eventCtrl, scope, httpBackend, rootScope, deffered, imageService, eventService,
    postService, messageService, mdDialog;

  var splab = {name: 'Splab', key: '098745'};
  var EVENTS_URI = '/api/events';

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
        $rootScope, ImageService, EventService, PostService, MessageService, $mdDialog) {
      imageService = ImageService;
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      deffered = $q.defer();
      eventService = EventService;
      postService = PostService;
      messageService = MessageService;
      mdDialog = $mdDialog;
      AuthService.login(user);

      spyOn(Utils, 'setScrollListener').and.callFake(function() {});

      eventCtrl = $controller('EventController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            eventService: eventService,
            postService : postService,
            messageService : messageService,
            mdDialog: mdDialog
        });

      httpBackend.when('GET', "/api/events?page=0&limit=5").respond({events: [event_convert_date], next: false});
      httpBackend.when('GET', 'main/main.html').respond(200);
      httpBackend.when('GET', 'home/home.html').respond(200);
      httpBackend.when('GET', 'auth/login.html').respond(200);
      httpBackend.flush();
  }));

  afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
  });

  describe('deleteEvent()', function(){
    beforeEach(function() {
      spyOn(mdDialog, 'confirm').and.callThrough();
      spyOn(mdDialog, 'show').and.callFake(function(){
        return {
          then: function(callback) {
            return callback();
          }
        };
      });
      spyOn(eventService, 'deleteEvent').and.callThrough();
    });

    it('Should remove event of events', function() {
      var event = eventCtrl.events[0];
      console.log(eventCtrl.events);
      httpBackend.expect('DELETE', EVENTS_URI + '/' + event.key).respond();
      eventCtrl.deleteEvent("$event", event);
      httpBackend.flush();

      expect(eventCtrl.events).not.toContain(event_convert_date);
      expect(eventService.deleteEvent).toHaveBeenCalledWith(event);
      expect(mdDialog.confirm).toHaveBeenCalled();
      expect(mdDialog.show).toHaveBeenCalled();
    });
  });

  describe('recognizeUrl()', function() {

    it('Should returns a event with https url in text', function() {
      event_convert_date.text = "Access: http://www.google.com";
      event_convert_date.text = eventCtrl.recognizeUrl(event_convert_date);
      expect(event_convert_date.text)
        .toEqual("Access: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
    });
  });

  describe('isLongText()', function() {

    it('Should be false', function() {
      expect(eventCtrl.isLongText(event_convert_date)).toBe(false);
    });

    it('Should be true', function() {
      event_convert_date.text = "Access: www.google.com aAt vero et accusamus et iusto odio dignis\
                  simos ducimus quiblanditiis praesentium voluptatum deleniti atque corr\
                  pti quos dolores et quas molestias excepturi sint occaecati cupiditate\
                  non provident, similique sunt in culpa qui officia deserunt mollitia"
      expect(eventCtrl.isLongText(event_convert_date)).toBe(true);
    });
  });

  describe('editEvent', function() {

    it('should call $mdDialog.show', function() {
      spyOn(mdDialog, 'show');
      eventCtrl.editEvent('$event', event);
      expect(mdDialog.show).toHaveBeenCalled();
    });
  });
}));