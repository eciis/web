'use strict';

(describe('Test EventDialogController', function() {

  let controller, scope, httpBackend, rootScope, imageService, eventService,
    messageService, newCtrl, state, mdDialog, states, deferred;

  const
    splab = {name: 'Splab', key: '098745'},
    date_now = new Date(),
    user = {
        name: 'User',
        institutions: [splab],
        follows: splab,
        institutions_admin: splab,
        current_institution: splab,
        key: '123',
        state: 'active'
    },
    address = {
          city: "city",
          country: "Country",
          neighbourhood: "neighbourhood",
          number: "555",
          state: "State",
          street: "Street x"
    },

  // Event of SPLAB by User
    event = {
      'title': 'Title',
      'text': 'Text',
      'local': 'Local',
      'photo_url': null,
      'start_time': date_now,
      'end_time': date_now,
      'video_url': [],
      'useful_links': [],
      'address': address,
      'key': '123456',
      'author_key': user.key
    },
    post = new Post({}, splab.key),
    event_convert_date = new Event(event, splab.key);

    post.shared_event = event.key;

  beforeEach(module('app'));

  beforeEach(inject(function($controller, $httpBackend, AuthService,
        $rootScope, ImageService, EventService,  MessageService, $state, $mdDialog, STATES, $q) {
      imageService = ImageService;
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      eventService = EventService;
      messageService = MessageService;
      newCtrl = $controller;
      state = $state;
      mdDialog = $mdDialog;
      states = STATES;
      deferred = $q.defer();
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


  describe('EventDialogController functions', () => {

    describe('showButtonSend()', () => {

      it('should be true', () => {
        expect(controller.showButtonSend()).toBe(true);
      });

      it('should be false', () => {
        controller.event = new Event({
              'text': 'Text',
              'photo_url': null,
              'start_time': new Date(),
              'end_time': new Date(),
              'key': '12300'
        }, splab.key);
        expect(controller.showButtonSend()).toBe(false);
      });

      it('should be false', () => {
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

    describe('showImage()', () => {

      it('should be false', () => {
        expect(controller.showImage()).toBe(false);
      });

      it('should be true', () => {
        controller.photoUrl = 'image';
        expect(controller.showImage()).toBe(true);
       });
      });

    describe('save()', () => {

      it('should eventService.createEvent be called', () => {
        spyOn(eventService, 'createEvent').and.callFake(() => {
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

      it('should call eventService.editEvent', () => {
        spyOn(eventService, 'editEvent').and.callFake(() => {
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

      it('should call eventService.createEvent', () => {
        spyOn(eventService, 'createEvent').and.returnValue(Promise.resolve());
        var event = new Event(controller.event, controller.user.current_institution.key);
        controller.isEditing = false;
        controller.save();
        expect(eventService.createEvent).toHaveBeenCalledWith(event);
      });

      describe('MessageService.showToast()', () => {

        it('should be invalid, because title is undefined', () => {
          controller.event.title = undefined;
          spyOn(messageService, 'showToast');
          controller.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });

        it('should be invalid, because local is undefined', () => {
          controller.event.title = "Inauguration";
          controller.event.local = undefined;
          spyOn(messageService, 'showToast');
          controller.save();
          scope.$apply();
          expect(messageService.showToast).toHaveBeenCalledWith('Evento inválido!');
        });
      });

      describe('changeUrlLink()', () => {
        it('Should call addUrl', () => {
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

        it('Should call removeUrl', () => {
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

      describe('getEmptyUrl', () => {
        it('Should return an empty url', () => {
          var url = {
            url: '',
            description: ''
          };
          var urlList = [url];

          expect(controller.getEmptyUrl(urlList)).toEqual(url);
        });
      });

      describe('getStep', () => {
        it('should return if step is current', () => {
          spyOn(controller, 'save').and.callFake(() => {});
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

      describe('nextStep', () => {
        beforeEach(() => {
            controller.steps = [true, false, false];
        });

        it('should call showToast', () => {
            spyOn(messageService, 'showToast');
            controller.event.address = {};
            controller.nextStep();
            expect(messageService.showToast).toHaveBeenCalled();
        });

        it('should not pass from first step', () => {
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

        it('should not pass from first step', () => {
            controller.event.title = "";
            controller.nextStep();
            expect(controller.steps).toEqual([true, false, false]);
        });

        it('should not pass from first step', () => {
            controller.event.title = "Title";
            controller.event.local = "";
            controller.nextStep();
            expect(controller.steps).toEqual([true, false, false]);
        });

        it('should not pass from first step', () => {
          controller.event.title = "Title";
          controller.event.address = address;
          controller.event.local = "Local";
          controller.event.start_time = undefined;
          controller.event.end_time = date_now;
          controller.nextStep();
          expect(controller.steps).toEqual([true, false, false]);
        });

        it('should pass from first and second step', () => {
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

      describe('isEventOutDate', () => {
        it('should return true', () => {
          controller.event.end_time.setFullYear(2000);
          expect(controller.isEventOutdated()).toBe(true);
        });

        it('should return false', () => {
          controller.event.end_time.setFullYear(3100);
          expect(controller.isEventOutdated()).toBe(false);
        });
      });
    });

    describe('isValidStepOne()', () => {

      describe('if is mobile screen', () => {
        beforeEach(() => {
          spyOn(Utils, 'isMobileScreen').and.returnValue(true);
        });

        it('Should return true if is valid address', () => {
          spyOn(controller, 'isValidAddress').and.returnValue(true);
          expect(controller.isValidStepOne()).toBeTruthy();
        });
  
        it('Should return false if is not valid address', () => {
          spyOn(controller, 'isValidAddress').and.returnValue(false);
          expect(controller.isValidStepOne()).toBeFalsy();
        });
      });

      describe('if is not mobile screen', () => {
        beforeEach(() => {
          spyOn(Utils, 'isMobileScreen').and.returnValue(false);
        });

        it('Should return true if is valid address and is valid date', () => {
          spyOn(controller, 'isValidAddress').and.returnValue(true);
          spyOn(controller, 'isValidDate').and.returnValue(true);
          expect(controller.isValidStepOne()).toBeTruthy();
        });

        it('Should return false if is valid address and is not valid date', () => {
          spyOn(controller, 'isValidAddress').and.returnValue(true);
          spyOn(controller, 'isValidDate').and.returnValue(false);
          expect(controller.isValidStepOne()).toBeFalsy();
        });

        it('Should return false if is not valid address and is valid date', () => {
          spyOn(controller, 'isValidAddress').and.returnValue(false);
          spyOn(controller, 'isValidDate').and.returnValue(true);
          expect(controller.isValidStepOne()).toBeFalsy();
        });
      });
    });

    describe('previousStep()', () => {
      it('Should return call cancelCreation if the currentStep is the first step', () => {
        controller.steps = [true, false, false, false];
        controller.$onInit();
        spyOn(controller, 'cancelCreation');
        expect(controller.getStep(1)).toBeTruthy();
        controller.previousStep();
        expect(controller.cancelCreation).toHaveBeenCalled();
      });

      it('Should return to previous step if is not the first step', () => {
        controller.steps = [false, true, false, false];
        controller.$onInit();
        expect(controller.getStep(2)).toBeTruthy();
        expect(controller.getStep(1)).toBeFalsy();
        controller.previousStep();
        expect(controller.getStep(2)).toBeFalsy();
        expect(controller.getStep(1)).toBeTruthy();
      });
    });

    describe('cancelCreation()', () => {

      beforeEach(() => {
        spyOn(state, 'go');
        spyOn(mdDialog, 'hide');
        spyOn(Utils, 'resetToolbarDisplayStyle').and.callFake(() => {});
      });

      it('should call state.go if is mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(true);
        controller.cancelCreation();
        expect(state.go).toHaveBeenCalledWith(states.EVENTS);
      });

      it('should call mdDialog.hide if is not mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(false);
        controller.cancelCreation();
        expect(mdDialog.hide).toHaveBeenCalled();
        //expect(state.go).not.toHaveBeenCalled();
      });
    });

    describe('lastStep()', () => {
      it('should get the step 4 if is mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(true);
        spyOn(controller, 'getStep');
        controller.lastStep();
        expect(controller.getStep).toHaveBeenCalledWith(4);
      });

      it('should get the step 3 if is not mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(false);
        spyOn(controller, 'getStep');
        controller.lastStep();
        expect(controller.getStep).toHaveBeenCalledWith(3);
      });
    });

    describe('getStreetPlaceholder()', () => {
      const street = "Rua";
      it('should return "Rua" if another country is selected', () => {
        controller.isAnotherCountry = true;
        expect(controller.getStreetPlaceholder()).toEqual(street);
      });

      it('should return "Rua *" if another country is not selected', () => {
        controller.isAnotherCountry = false;
        expect(controller.getStreetPlaceholder()).toEqual(street + " *");
      });
    });

    describe('_loadStateParams()', () => {
      beforeEach(() => {
        state.params.event = event;
        state.params.events = [event];
        state.params.isEditing = true;
        controller.event = undefined;
        controller.events = undefined;
        controller.isEditing = undefined;
      });

      it('should not load the state params if is not mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(false);
        controller._loadStateParams();
        expect(controller.event).toBe(undefined);
        expect(controller.events).toBe(undefined);
        expect(controller.isEditing).toBe(undefined);
      });

      it('should load the state params if is mobile screen', () => {
        spyOn(Utils, 'isMobileScreen').and.returnValue(true);
        controller._loadStateParams();
        expect(controller.event).toEqual(event);
        expect(controller.events).toEqual([event]);
        expect(controller.isEditing).toEqual(true);
      });
    });

    describe('addStartHour()', () => {
      it('should set the hours of start time', () => {
        controller.event.start_time = new Date(2018, 12, 12);
        controller.startHour = undefined;
        controller.createInitDate();
        expect(controller.event.start_time.getHours()).not.toEqual(9);
        expect(controller.event.start_time.getMinutes()).not.toEqual(55);
        controller.startHour = new Date(2018,12,12, 9, 55);
        controller.addStartHour();
        expect(controller.event.start_time.getHours()).toEqual(9);
        expect(controller.event.start_time.getMinutes()).toEqual(55);
      });
    });

    describe('addEndHour()', () => {
      it('should set the hours of end time', () => {
        controller.event.end_time = new Date(2018, 12, 12);
        controller.endHour = new Date(2018,12,12, 9, 55);
        expect(controller.event.end_time.getHours()).not.toEqual(9);
        expect(controller.event.end_time.getMinutes()).not.toEqual(55);
        controller.addEndHour();
        expect(controller.event.end_time.getHours()).toEqual(9);
        expect(controller.event.end_time.getMinutes()).toEqual(55);
      });
    });

    describe('setToEntireDay()', () => {
      it('Should set the start time to 8AM and end time to 6PM of the same day', () => {
        controller.event.start_time = new Date(2018,12,12);
        controller.createInitDate();
        expect(controller.event.start_time.getHours()).not.toEqual(8);
        expect(controller.event.end_time.getHours()).not.toEqual(18);
        controller.setToEntireDay();
        expect(controller.event.start_time.getHours()).toEqual(8);
        expect(controller.event.start_time.getMinutes()).toEqual(0);
        expect(controller.event.end_time.getHours()).toEqual(18);
        expect(controller.event.end_time.getMinutes()).toEqual(0);
      });
    });

    describe('_loadEvent()', () => {

      describe('in success case', () => {
        beforeEach(() => {
          spyOn(eventService, 'getEvent').and.callFake(() => {
            return {
              then: function (callback) {
                return callback(event);
              }
            };
          });
        });

        it('Should load the event in controller', () => {
          controller.event = null;
          controller._loadEvent(event.key);
          expect(eventService.getEvent).toHaveBeenCalledWith(event.key);
          expect(controller.event).toEqual(event);
        });

        it('Should call state.go if the user is not the author of event', () => {
          spyOn(state, 'go');
          event.author_key = '000';
          controller._loadEvent(event.key);
          expect(state.go).toHaveBeenCalledWith(states.EVENTS);
        });

        it('Should change isEditing to true', () => {
          controller.isEditing = false;
          controller._loadEvent(event.key);
          expect(controller.isEditing).toBeTruthy();
        });

        it('Should call _loadStatesToEdit()', () => {
          spyOn(controller, '_loadStatesToEdit');
          controller._loadEvent(event.key);
          expect(controller._loadStatesToEdit).toHaveBeenCalled();
        });
      });

      describe('in fail case', () => {
        it('Should call messageService.showToast and state.go', () => {
          spyOn(eventService, 'getEvent').and.returnValue(deferred.promise);
          spyOn(messageService, 'showToast');
          spyOn(state, 'go');
          deferred.reject();
          controller._loadEvent(event.key);
          scope.$apply();
          expect(state.go).toHaveBeenCalledWith(states.HOME);
          expect(messageService.showToast).toHaveBeenCalledWith("Erro ao carregar evento.");
        });
      });
    });

    describe('_loadStatesToEdit()', () => {
      it('PhotoURL of the controller should be equal to the event photoURL', () => {
        controller.photoUrl = undefined;
        controller.event.photo_url = "photo.jpeg";
        controller._loadStatesToEdit();
        expect(controller.photoUrl).toEqual(controller.event.photo_url);
      });

      it('The property isAnotherCountry of the controller should be true if selected country is not Brazil', () => {
        controller.isAnotherCountry = undefined;
        controller._loadStatesToEdit();
        expect(controller.isAnotherCountry).toBeTruthy();
      });

      it('The property isAnotherCountry of the controller should be false if selected country is Brazil', () => {
        controller.isAnotherCountry = undefined;
        controller.event.address.country = "Brasil";
        controller._loadStatesToEdit();
        expect(controller.isAnotherCountry).toBeFalsy();
      });
    });

    describe('happensInOnlyDay()', () => {
      it('Should return true if the event begin and end in the same day', () => {
        controller.event.start_time = new Date(2018, 12, 12);
        controller.event.end_time = new Date(2018, 12, 12);
        expect(controller.happensInOnlyDay()).toBeTruthy();
      });

      it('Should return false if the event begin and end in different days', () => {
        controller.event.start_time = new Date(2018, 12, 12);
        controller.event.end_time = new Date(2018, 12, 13);
        expect(controller.happensInOnlyDay()).toBeFalsy();
      });
    });

    describe('$onInit()', () => {
      it('should call _loadStateParams()', () => {
        spyOn(controller, '_loadStateParams');
        controller.$onInit();
        expect(controller._loadStateParams).toHaveBeenCalled();
      });

      it('should call _loadStatesToEdit if have an event', () => {
        spyOn(controller, '_loadStatesToEdit');
        controller.event = event;
        controller.$onInit();
        expect(controller._loadStatesToEdit).toHaveBeenCalled();
      });

      it('should call _loadEvent if not have an event and have eventKey in state params', () => {
        spyOn(controller, '_loadEvent');
        controller.event = null;
        state.params.eventKey = event.key;
        controller.$onInit();
        expect(controller._loadEvent).toHaveBeenCalled();
      });

      it('should set the event object with default address', () => {
        controller.event = undefined;
        state.params.eventKey = undefined;
        controller.$onInit();
        expect(controller.event).toEqual(
          {
            address: {
              country: "Brasil"
        }});
      });
    });
  });
}));