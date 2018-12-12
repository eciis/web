'use strict';

(describe('Test EventDialogController', function() {

  var controller, scope, httpBackend, rootScope, deferred, imageService, eventService,
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

  var address = {
        city: "city",
        country: "Country",
        neighbourhood: "neighbourhood",
        number: "555",
        state: "State",
        street: "Street x"
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
    'address': address
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
      deferred = $q.defer();
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
      controller.$onInit();
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
        spyOn(eventService, 'createEvent').and.callFake(function () {
          return {
            then: function (callback) {
              return callback({data: {key: 'oaksp-OAKDSOP'}});
            }
          };
        });
        spyOn(controller.user, 'addPermissions');
        controller.user.permissions = {};
        controller.save();
        expect(eventService.createEvent).toHaveBeenCalledWith(event_convert_date);
        expect(controller.user.addPermissions).toHaveBeenCalled();
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
        controller.save();
        expect(eventService.editEvent).toHaveBeenCalled();
      });

      it('should call eventService.createEvent', function() {
        spyOn(eventService, 'createEvent').and.returnValue(Promise.resolve());
        var event = new Event(controller.event, controller.user.current_institution.key);
        controller.isEditing = false;
        controller.save();
        expect(eventService.createEvent).toHaveBeenCalledWith(event);
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

      describe('changeUrlLink()', function() {
        it('Should call addUrl', function () {
          spyOn(controller, 'addUrl').and.callThrough();
          var urlList = [];
          var url = {
            url: 'url',
            description: 'url'
          };
          expect(urlList.length).toEqual(0);
          controller.changeUrlLink(url, urlList);
          expect(controller.videoUrls.length).toEqual(1);
          expect(controller.addUrl).toHaveBeenCalled();
        });

        it('Should call removeUrl', function () {
          var urlList = [{
            url: 'url',
            description: 'url'
          }, {
            url: '',
            description: 'url description'
          }];

          var url = {
            url: '',
            description: 'url'
          };

          spyOn(controller, 'removeUrl').and.callThrough();
          expect(urlList.length).toEqual(2);
          controller.changeUrlLink(url, urlList);
          expect(controller.videoUrls.length).toEqual(1);
          expect(controller.removeUrl).toHaveBeenCalled();
        });
      });

      describe('getEmptyUrl', function() {
        it('Should return an empty url', function () {
          var url = {
            url: '',
            description: ''
          };
          var urlList = [url];

          expect(controller.getEmptyUrl(urlList)).toEqual(url);
        });
      });

      describe('getStep', function() {
        it('should return if step is current', function () {
          spyOn(controller, 'save').and.callFake(function() {});
          controller.event.local = "Local";

          expect(controller.getStep(1)).toEqual(true);
          controller.nextStep();
          expect(controller.getStep(1)).toEqual(false);
          expect(controller.getStep(2)).toEqual(true);
          controller.previousStep();
          expect(controller.getStep(1)).toEqual(true);
          expect(controller.getStep(2)).toEqual(false);

          controller.nextStepOrSave();
          controller.nextStepOrSave();
          controller.nextStepOrSave();
          expect(controller.save).toHaveBeenCalled();
          expect(controller.getStep(1)).toEqual(false);
          expect(controller.getStep(2)).toEqual(false);
          expect(controller.getStep(3)).toEqual(true);
        });
      });

      describe('nextStep', function() {
        beforeEach(function() {
            controller.steps = [true, false, false];
        });

        it('should call showToast', function() {
            spyOn(messageService, 'showToast');
            controller.event.address = {};
            controller.nextStep();
            expect(messageService.showToast).toHaveBeenCalled();
        });

        it('should not pass from first step', function() {
            controller.event.address = undefined;
            controller.nextStep();
            expect(controller.getStep(1)).toEqual(true);
            controller.event.address = {
                street: "floriano",
                city: "example",
                country: "Brasil"
            };
            expect(controller.getStep(1)).toEqual(true);
        });

        it('should not pass from first step', function() {
            controller.event.title = "";
            controller.nextStep();
            expect(controller.steps).toEqual([true, false, false]);
        });

        it('should not pass from first step', function() {
            controller.event.title = "Title";
            controller.event.local = "";
            controller.nextStep();
            expect(controller.steps).toEqual([true, false, false]);
        });

        it('should not pass from first step', function() {
          controller.event.title = "Title";
          controller.event.address = address;
          controller.event.local = "Local";
          controller.event.start_time = undefined;
          controller.event.end_time = date_now;
          controller.nextStep();
          expect(controller.steps).toEqual([true, false, false]);
        });

        it('should pass from first and second step', function() {
          controller.event.title = "Title";
          controller.event.local = "Local";
          controller.event.address = address;
          controller.event.start_time =  date_now;
          controller.event.end_time = date_now;
          controller.nextStep();
          expect(controller.steps).toEqual([false, true, false]);
          controller.nextStep();
          expect(controller.steps).toEqual([false, false, true]);
        });
      }); 

      describe('isEventOutDate', function() {
        it('should return true', function() {
          controller.event.end_time.setFullYear(2000);
          expect(controller.isEventOutdated()).toBe(true);
        });

        it('should return false', function() {
          controller.event.end_time.setFullYear(3100);
          expect(controller.isEventOutdated()).toBe(false);
        });
      });
    });
  });
}));