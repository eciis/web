'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, AuthService, ImageService,
                     $rootScope, mdcDateTimeDialog, EventService, $state) {
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

        eventCtrl.save = function save() {
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
        };

        function create() {
            var event = new Event(eventCtrl.event, eventCtrl.user.current_institution.key);
            if (event.isValid()) {
                EventService.createEvent(event).then(function success(response) {
                    eventCtrl.clean();
                    eventCtrl.events.push(response.data);
                    MessageService.showToast('Evento criado com sucesso, esperando aprovação!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    $state.go('app.home');
                });
            } else {
                MessageService.showToast('Evento inválido!');
            }
        }

        function loadEvents() {
            EventService.getEvents().then(function success(response) {
                eventCtrl.events = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                    $state.go('app.home');
            });
        }

        eventCtrl.clean = function() {
            eventCtrl.event = {};
            eventCtrl.showButton = true;
            eventCtrl.cleanImage();
        };

        eventCtrl.showButtonSend = function() {
            var isTitleUndefined = eventCtrl.event.title === undefined;
            var isLocalUndefined = eventCtrl.event.local === undefined;
            var isValidDate = eventCtrl.event.start_time <= 
                eventCtrl.event.end_time;
            return !isTitleUndefined && isValidDate && !isLocalUndefined;
        };

        eventCtrl.showImage = function() {
            var isImageEmpty = eventCtrl.photoUrl === "";
            var isImageNull = eventCtrl.photoUrl === null;
            return !isImageEmpty && !isImageNull;
        };

        eventCtrl.cleanImage = function() {
           eventCtrl.photoUrl = "";
           eventCtrl.photoBase64Data = null;
           eventCtrl.deletePreviousImage = true;
        };

        loadEvents();
    });
})();