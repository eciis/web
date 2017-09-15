'use strict';

(describe('Test EventController', function() {

  var eventCtrl, scope, httpBackend, rootScope, deffered, imageService,
        eventService, postService, messageService;

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
  var event = {'title': 'Inauguration',
                'local': 'Brasilia',
                'photo_url': null,
                'start_time': date_now, 
                'end_time': date_now,
                'key': '15964'
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
      AuthService.login(maiana);
      eventCtrl = $controller('EventController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            eventService: eventService,
            postService : postService,
            messageService : messageService
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

    describe('showButtonSend()', function() {

      it('should be true', function() {
        expect(eventCtrl.showButtonSend()).toBe(true);
      });

      it('should be false', function() {
        eventCtrl.event = new Event({
              'text': 'Inauguration of system E-CIS',
              'photo_url': null,
              'start_time': new Date(), 
              'end_time': new Date(),
              'key': '12300'
        }, splab.key);
        expect(eventCtrl.showButtonSend()).toBe(false);
      });

      it('should be false', function() {
        eventCtrl.event = new Event({
              'title': 'Inauguration',
              'photo_url': null,
              'start_time': new Date("October 13, 2014 11:13:00"), 
              'end_time': new Date("October 3, 2014 11:13:00"),
              'key': '12300'
              }, splab.key);
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

      it('should eventService.createEvent be called', function() {
        spyOn(eventService, 'createEvent').and.returnValue(deffered.promise);
        deffered.resolve(event);
        eventCtrl.save();
        scope.$apply();
        expect(eventService.createEvent).toHaveBeenCalledWith(event_convert_date);
      });

      describe('MessageService.showToast()', function(){

        it('should be invalid, because title is undefined', function() {
          eventCtrl.event.title = undefined; 
          spyOn(messageService, 'showToast');
          eventCtrl.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });

        it('should be invalid, because local is undefined', function() {
          eventCtrl.event.title = "Inauguration"; 
          eventCtrl.event.local = undefined; 
          spyOn(messageService, 'showToast');
          eventCtrl.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });
      });
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

    describe('clean()', function() {

      it('Must clear attributes of controller', function() {
        spyOn(eventCtrl, 'cleanImage');
        eventCtrl.clean();
        expect(eventCtrl.event).toEqual({});
        expect(eventCtrl.showButton).toBe(true);
        expect(eventCtrl.cleanImage).toHaveBeenCalled();
      });
    });
  });
}));