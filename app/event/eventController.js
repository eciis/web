'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, EventService, 
            $state, $mdDialog, AuthService, PostService) {
        var eventCtrl = this;

        eventCtrl.events = [];

        eventCtrl.user = AuthService.getCurrentUser();

        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";
        var LIMIT_CHARACTERS = 100;

        function loadEvents() {
            EventService.getEvents().then(function success(response) {
                eventCtrl.events = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                $state.go('app.home');
            });
        }

        eventCtrl.newEvent = function newEvent(event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'event/event_dialog.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    events: eventCtrl.events
                },
                bindToController: true
            });
        };

        eventCtrl.share = function share(event) {
            var post = new Post({}, eventCtrl.user.current_institution.key);
            post.shared_event = event.key;
            PostService.createPost(post).then(function success() {
                MessageService.showToast('Evento compartilhado com sucesso!');
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });

        };

        eventCtrl.deleteEvent = function deleteEvent(ev, event) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Evento')
                .textContent('Este evento será removido.')
                .ariaLabel('Deletar evento')
                .targetEvent(ev)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                EventService.deleteEvent(event).then(function success() {
                _.remove(eventCtrl.events, function(ev){
                    return ev === event;
                });
                MessageService.showToast('Evento removido com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        eventCtrl.recognizeUrl =  function recognizeUrl(text) {
            if(text){
                var urlsInText = text.match(URL_PATTERN);
                text = addHttpsToUrl(text, urlsInText);
                text = adjustText(text);
                return text;
            }
        };

        eventCtrl.isLongText = function isLongText(text){
            var numberOfChar = text.length;
            return numberOfChar >= LIMIT_CHARACTERS;
        };

        eventCtrl.isAuthorized = function isAuthorized(event) {
            return eventCtrl.isEventAuthor(event) || isInstitutionAdmin(event);
        };

        eventCtrl.isEventAuthor = function isEventAuthor(event) {
            return getKeyFromUrl(event.author_key) === eventCtrl.user.key;
        };

        function isInstitutionAdmin(event) {
            return _.includes(_.map(eventCtrl.user.institutions_admin, getKeyFromUrl), event.institution_key);
        }

        function adjustText(text){
            if(eventCtrl.isLongText(text)){
                text = text.substring(0, LIMIT_CHARACTERS) + "...";
            }
            return text.replace(URL_PATTERN,REPLACE_URL);
        }

        function addHttpsToUrl(text, urls) {
            if(urls) {
                var http = "http://";
                for (var i = 0; i < urls.length; i++) {
                    if(urls[i].slice(0, 4) !== "http") {
                        text = text.replace(urls[i], http + urls[i]);
                    }
                }
            }
            return text;
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
        }

        (function main() {
            loadEvents();
        })();
    });

    app.controller('EventDialogController', function EventDialogController(MessageService, 
            ImageService, AuthService, EventService, $state, $rootScope, $mdDialog) {
        var dialogCtrl = this;

        dialogCtrl.event = {};
        dialogCtrl.loading = false;
        dialogCtrl.user = AuthService.getCurrentUser();
        dialogCtrl.deletePreviousImage = false;
        dialogCtrl.photoUrl = "";

        dialogCtrl.save = function save() {
            if (dialogCtrl.photoBase64Data) {
                dialogCtrl.loading = true;
                ImageService.saveImage(dialogCtrl.photoBase64Data).then(function success(data) {
                    dialogCtrl.loading = false;
                    dialogCtrl.event.photo_url = data.url;
                    dialogCtrl.event.uploaded_images = [data.url];
                    create();
                    dialogCtrl.event.photo_url = null;
                });
            } else {
                create();
            }
        };

        dialogCtrl.addImage = function(image) {
            var newSize = 1024;

            ImageService.compress(image, newSize).then(function success(data) {
                dialogCtrl.photoBase64Data = data;
                ImageService.readFile(data, setImage);
                dialogCtrl.deletePreviousImage = true;
                dialogCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        dialogCtrl.closeDialog = function closeDialog() {
            $mdDialog.hide();
        };

        dialogCtrl.showButtonSend = function() {
            var isTitleUndefined = dialogCtrl.event.title === undefined;
            var isLocalUndefined = dialogCtrl.event.local === undefined;
            var isDateStartUndefined = dialogCtrl.event.start_time === undefined;
            var isDateEndUndefined = dialogCtrl.event.end_time === undefined;
            return !isTitleUndefined && !isLocalUndefined &&
                    !isDateStartUndefined && !isDateEndUndefined;
        };

        dialogCtrl.showImage = function() {
            var isImageEmpty = dialogCtrl.photoUrl === "";
            var isImageNull = dialogCtrl.photoUrl === null;
            return !isImageEmpty && !isImageNull;
        };

        dialogCtrl.cleanImage = function() {
           dialogCtrl.photoUrl = "";
           dialogCtrl.photoBase64Data = null;
           dialogCtrl.deletePreviousImage = true;
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                dialogCtrl.photoUrl = image.src;
            });
        }

        function create() {
            var event = new Event(dialogCtrl.event, dialogCtrl.user.current_institution.key);
            if (event.isValid()) {
                EventService.createEvent(event).then(function success(response) {
                    dialogCtrl.closeDialog();
                    dialogCtrl.events.push(response.data);
                    MessageService.showToast('Evento criado com sucesso, esperando aprovação!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    $state.go('app.home');
                });
            } else {
                MessageService.showToast('Evento inválido!');
            }
        }
    });
})();