'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, AuthService, ImageService,
                     $rootScope, mdcDateTimeDialog, mdcDatetimePickerDefaultLocale, EventService, $state) {
        var eventCtrl = this;

        eventCtrl.event = {};
        eventCtrl.events = [];

        eventCtrl.loading = false;
        eventCtrl.deletePreviousImage = false;
        eventCtrl.showButton = true;

        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.photoUrl = "";

        eventCtrl.addImage = function(image) {
            var newSize = 1024;

            ImageService.compress(image, newSize).then(function success(data) {
                eventCtrl.photoBase64Data = data;
                ImageService.readFile(data, setImage);
                eventCtrl.deletePreviousImage = true;
                eventCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                eventCtrl.photoUrl = image.src;
            });
        }

        eventCtrl.isValidEvent = function isValidEvent() {
            var isTitleUndefined = eventCtrl.event.title === undefined;
            var isLocalUndefined = eventCtrl.event.local === undefined;
            var isValidDate = eventCtrl.event.start_time <= 
                eventCtrl.event.end_time;
            return !isTitleUndefined && isValidDate && !isLocalUndefined;
        };

        eventCtrl.save = function save() {
            if (eventCtrl.isValidEvent()) {
                loadImage();
            } else {
                MessageService.showToast("Evento é inválido");
            }
        };

        function loadEvents() {
            EventService.getEvents().then(function success(response) {
                eventCtrl.events = response.data;
            }, function error(response) {
                AuthService.reload().then(function success() {
                    MessageService.showToast(response.data.msg);
                    $state.go('app.home');
                });
            });
        }

        function loadImage(){
            if (eventCtrl.photoBase64Data) {
                eventCtrl.loading = true;
                ImageService.saveImage(eventCtrl.photoBase64Data).then(function success(data) {
                    eventCtrl.loading = false;
                    eventCtrl.event.photo_url = data.url;
                    eventCtrl.event.uploaded_images = [data.url];
                    create();
                    eventCtrl.event.photo_url = null;
                });
            } else {
                create();
            }
        }

        function create() {
            var event = new Event(eventCtrl.event, eventCtrl.user.current_institution.key);
            event.convertDate();
            if (event.isValid()) {
                EventService.createEvent(event).then(function success() {
                    eventCtrl.clear();
                    eventCtrl.events.push(event);
                    MessageService.showToast('Evento criado com sucesso, esperando aprovação!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    $state.go('app.home');
                });
            } else {
                MessageService.showToast('Evento inválido!');
            }
        }

        eventCtrl.clear = function() {
            eventCtrl.event = {};
            eventCtrl.photoUrl = "";
            eventCtrl.showButton = true;
            eventCtrl.photoBase64Data = undefined;
        };

        eventCtrl.showButtonSend = function() {
            return eventCtrl.isValidEvent();
        };

        eventCtrl.showImage = function() {
            var isImageEmpty = eventCtrl.photoUrl === "";
            var isImageNull = eventCtrl.photoUrl === null;
            return !isImageEmpty && !isImageNull;
        };

        eventCtrl.hideImage = function() {
           eventCtrl.photoUrl = "";
           eventCtrl.photoBase64Data = null;
           eventCtrl.deletePreviousImage = true;
        };

        loadEvents();
    });
})();