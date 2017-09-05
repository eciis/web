'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, AuthService, ImageService,
                     $rootScope, mdcDateTimeDialog, EventService, $state) {
        var eventCtrl = this;

        eventCtrl.event = {};
        eventCtrl.loading = false;
        eventCtrl.deletePreviousImage = false;
        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.photoUrl = "";
        eventCtrl.date = "";

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

        eventCtrl.isEventValid = function isEventValid() {
            var isTitleUndefined = eventCtrl.event.title === undefined;
            var dateValid = eventCtrl.event.start_time <= 
                eventCtrl.event.end_time;
            return !isTitleUndefined && dateValid;
        };

        eventCtrl.save = function save() {
            if(eventCtrl.isEventValid()){
                loadImage();
            }else{
                MessageService.showToast("Evento é inválido");
            }
        };

        function loadImage(){
            if (eventCtrl.photoBase64Data) {
                eventCtrl.loading = true;
                ImageService.saveImage(eventCtrl.photoBase64Data).then(function success(data) {
                    eventCtrl.loading = false;
                    eventCtrl.post.photo_url = data.url;
                    eventCtrl.post.uploaded_images = [data.url];
                    saveEvent(event);
                    eventCtrl.post.photo_url = null;
                });
            } else {
                saveEvent();
            }

        }

        function saveEvent() {
            var event = new Event(eventCtrl.event, eventCtrl.user.current_institution.key);
            if (event.isValid()) {
                EventService.createEvent(event).then(function success() {
                    eventCtrl.event = {};
                    MessageService.showToast('Evento criado com sucesso, esperando aprovação!');
                }, function error(response) {
                    AuthService.reload().then(function success() {
                        MessageService.showToast(response.data.msg);
                        $state.go('app.home');
                    });
                });
            } else {
                MessageService.showToast('Evento inválido!');
            }
        }

        eventCtrl.showButton = function() {
            return eventCtrl.isEventValid();
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
    });
})();