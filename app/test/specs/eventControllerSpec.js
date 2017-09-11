'use strict';

(describe('Test EventController', function() {

  var eventCtrl, scope, httpBackend, rootScope, deffered, imageService, eventService, message;

  var splab = {name: 'Splab', key: '098745'};

  var date_now = new Date();

  var maiana = {
      name: 'Maiana',
      institutions: [splab],
      follows: splab,
      institutions_admin: splab,
      current_institution: splab,
      key: '123'
  };  

  // Event of SPLAB by Maiana
  var event = {'title': 'Inauguração',
                'text': 'Inaugurar o projeto E-CIS',
                'local': 'Brasília',
                'photo_url': null,
                'start_time': date_now, 
                'end_time': date_now,
                };

  var event_convert_date = new Event(event, splab.key);
  event_convert_date.convertDate();

  beforeEach(module('app'));

  beforeEach(inject(function($controller, $httpBackend, $http, $q, AuthService, $rootScope, ImageService, EventService, MessageService) {
      imageService = ImageService;
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      deffered = $q.defer();
      eventService = EventService;
      AuthService.login(maiana);
      eventCtrl = $controller('EventController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            eventService: eventService,
            message : MessageService
        });
      eventCtrl.event = event;

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

  describe('EventController functions', function() {

    describe('isValidEvent() and showButtonSend()', function() {

      it('should be true', function() {
        expect(eventCtrl.isValidEvent()).toBe(true);
        expect(eventCtrl.showButtonSend()).toBe(true);
      });

      it('should be false', function() {
        eventCtrl.event = new Event({
              'text': 'Inaugurar o projeto E-CIS',
                         'photo_url': null,
                        'start_time': new Date(), 
                         'end_time': new Date(),
                         'key': '12300'
                },
              splab.key);
        expect(eventCtrl.isValidEvent()).toBe(false);
        expect(eventCtrl.showButtonSend()).toBe(false);
      });

      it('should be false', function() {
        eventCtrl.event = new Event({
                        'title': 'Inauguração',
                        'photo_url': null,
                        'start_time': new Date("October 13, 2014 11:13:00"), 
                        'end_time': new Date("October 3, 2014 11:13:00"),
                        'key': '12300'
                       },
                       splab.key);
        expect(eventCtrl.isValidEvent()).toBe(false);
        expect(eventCtrl.showButtonSend()).toBe(false);
      });
    });

    describe('showImage()', function() {

      it('should be false', function() {
        expect(eventCtrl.showImage()).toBe(false);
      });

      it('should be true', function() {
        eventCtrl.photoUrl = 'image';
        expect(eventCtrl.showImage()).toBe(true);
       });
      });

    describe('save()', function() {

      it('should eventService.createEvent was called', function() {
        spyOn(eventService, 'createEvent').and.returnValue(deffered.promise);
        deffered.resolve(event);
        eventCtrl.save();
        scope.$apply();
        expect(eventService.createEvent).toHaveBeenCalledWith(event_convert_date);
      });
    });
  });
}));