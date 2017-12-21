'use strict';

(describe('Test EventDialogController', function() {

  var controller, scope, httpBackend, rootScope, deffered, imageService, eventService,
    postService, messageService, newCtrl;

  var EVENT_URI = "/api/events";

  var splab = {name: 'Splab', key: '098745'};

  var date_now = new Date();

  var user = {
      name: 'User',
      institutions: [splab],
      follows: splab,
      institutions_admin: splab,
      current_institution: splab,
      key: '123',
      state: 'active'
  };

  // Event of SPLAB by User
  var event = {
    'title': 'Title',
    'text': 'Text',
    'local': 'Local',
    'photo_url': null,
    'start_time': date_now,
    'end_time': date_now,
    'video_url': [], 
    'useful_links': [],
    'country': 'Brasil'
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
      newCtrl = $controller;
      AuthService.login(user);
      controller = newCtrl('EventDialogController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            eventService: eventService
        }, {
          event: event
        });
      controller.event = event;
      controller.events = [];

      httpBackend.when('GET', 'app/institution/countries.json').respond(200);
      httpBackend.flush();
  }));

  afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
  });

  describe('EventDialogController functions', function() {

    describe('showButtonSend()', function() {

      it('should be true', function() {
        expect(controller.showButtonSend()).toBe(true);
      });

      it('should be false', function() {
        controller.event = new Event({
              'text': 'Text',
              'photo_url': null,
              'start_time': new Date(),
              'end_time': new Date(),
              'key': '12300'
        }, splab.key);
        expect(controller.showButtonSend()).toBe(false);
      });

      it('should be false', function() {
        controller.event = new Event({
              'title': 'Title',
              'photo_url': null,
              'start_time': new Date("October 13, 2014 11:13:00"),
              'end_time': new Date("October 3, 2014 11:13:00"),
              'key': '12300'
              }, splab.key);
        expect(controller.showButtonSend()).toBe(false);
      });
    });

    describe('showImage()', function() {

      it('should be false', function() {
        expect(controller.showImage()).toBe(false);
      });

      it('should be true', function() {
        controller.photoUrl = 'image';
        expect(controller.showImage()).toBe(true);
       });
      });

    describe('save()', function() {

      it('should eventService.createEvent be called', function() {
        spyOn(eventService, 'createEvent').and.returnValue(deffered.promise);
        deffered.resolve(event);
        controller.save();
        scope.$apply();
        expect(eventService.createEvent).toHaveBeenCalledWith(event_convert_date);
      });

      it('should call eventService.editEvent', function() {
        spyOn(eventService, 'editEvent').and.callFake(function() {
          return {
            then: function(callback) {
              return callback();
            }
          };
        });
        controller.observer = jsonpatch.observe(controller.event);
        controller.isEditing = true;
        controller.dateChangeEvent = new Event(event, user.current_institution.key);
        controller.dateChangeEvent.start_time = new Date();
        controller.dateChangeEvent.end_time = new Date();
        controller.save();
        expect(eventService.editEvent).toHaveBeenCalled();
      });

      describe('MessageService.showToast()', function(){

        it('should be invalid, because title is undefined', function() {
          controller.event.title = undefined;
          spyOn(messageService, 'showToast');
          controller.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });

        it('should be invalid, because local is undefined', function() {
          controller.event.title = "Inauguration";
          controller.event.local = undefined;
          spyOn(messageService, 'showToast');
          controller.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });
      });
    });
  });
}));