'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, EventService,
            $state, $mdDialog, AuthService, $q) {
        var eventCtrl = this;
        var content = document.getElementById("content");

        var moreEvents = true;
        var actualPage = 0;

        eventCtrl.events = [];

        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;

        var LIMIT_CHARACTERS = 100;

        eventCtrl.loadMoreEvents = function loadMoreEvents() {
            var deferred = $q.defer();

            if (moreEvents) {
                loadEvents(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        Utils.setScrollListener(content, eventCtrl.loadMoreEvents);


        function loadEvents(deferred) {
            EventService.getEvents(actualPage).then(function success(response) {
                actualPage += 1;
                moreEvents = response.data.next;

                _.forEach(response.data.events, function(event) {
                    eventCtrl.events.push(event);
                });

                eventCtrl.isLoadingEvents = false;
                deferred.resolve();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                deferred.reject();
                $state.go("app.user.home");
            });
        }

        eventCtrl.newEvent = function newEvent(event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'app/event/event_dialog.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    events: eventCtrl.events
                },
                bindToController: true
            });
        };

        eventCtrl.share = function share(ev, event) {
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: 'app/post/share_post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    user : eventCtrl.user,
                    posts: [],
                    post: event,
                    addPost: false
                }
            });
        };

        eventCtrl.confirmDeleteEvent = function confirmDeleteEvent(ev, event) {
            var dialog = MessageService.showConfirmationDialog(ev, 'Excluir Evento', 'Este evento será removido.');
            dialog.then(function() {
                deleteEvent(event);
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        function deleteEvent(event) {
            let promise = EventService.deleteEvent(event);
            promise.then(function success() {
                eventCtrl.events = eventCtrl.events.filter(thisEvent => thisEvent.key  !== event.key);
                MessageService.showToast('Evento removido com sucesso!');
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        eventCtrl.recognizeUrl =  function recognizeUrl(event) {
            if(event && event.text){
                var text = Utils.recognizeUrl(event.text);
                text = adjustText(text, event);
                return text;
            }
        };

        eventCtrl.isLongText = function isLongText(event){
            if(event.text) {
                var numberOfChar = event.text.length;
                return numberOfChar >= LIMIT_CHARACTERS;
            }
        };

        eventCtrl.canDelete = function canDelete(event) {
            return eventCtrl.isEventAuthor(event) || isInstitutionAdmin(event);
        };

        eventCtrl.canEdit = function canEdit(event) {
            return eventCtrl.isEventAuthor(event);
        };

        eventCtrl.editEvent = function editEvent(ev, event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'app/event/event_dialog.html',
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    event: event,
                    isEditing: true
                },
                bindToController: true
            });
        };

        eventCtrl.isEventAuthor = function isEventAuthor(event) {
            return Utils.getKeyFromUrl(event.author_key) === eventCtrl.user.key;
        };

        eventCtrl.goToEvent = function goToEvent(event) {
            $state.go('app.event', {eventKey: event.key});
        };


        eventCtrl.endInOtherMonth = function endInOtherMonth() {
            const startMonth = new Date(eventCtrl.event.start_time).getMonth();
            const endMonth = new Date(eventCtrl.event.end_time).getMonth();
            return startMonth !== endMonth;
        };

        function isInstitutionAdmin(event) {
            return _.includes(_.map(eventCtrl.user.institutions_admin, Utils.getKeyFromUrl),
                Utils.getKeyFromUrl(event.institution_key));
        }

        function adjustText(text, event){
            if(eventCtrl.isLongText(event)){
                text = text.substring(0, LIMIT_CHARACTERS) + "...";
            }
            return text;
        }

        (function main() {
            eventCtrl.loadMoreEvents();
        })();
    });

    app.directive("eventDetails", function() {
        return {
            restrict: 'E',
            templateUrl: "app/event/event_details.html",
            controllerAs: "eventDetailsCtrl",
            controller: "EventController",
            scope: {},
            bindToController: {
                event: '=',
                isEventPage: '=',
            }
        };
    });

    app.controller('EventDialogController', function EventDialogController(MessageService,
            ImageService, AuthService, EventService, $state, $rootScope, $mdDialog) {
        var dialogCtrl = this;

        dialogCtrl.loading = false;
        dialogCtrl.user = AuthService.getCurrentUser();
        dialogCtrl.deletePreviousImage = false;
        dialogCtrl.photoUrl = "";
        dialogCtrl.dateToChange = {};
        dialogCtrl.observer = {};

        dialogCtrl.save = function save() {
            if(!dialogCtrl.isEditing) {
                saveImageAndCallEventFunction(create);
            } else {
                saveImageAndCallEventFunction(updateEvent);
            }
        };

        function saveImageAndCallEventFunction(callback) {
            if (dialogCtrl.photoBase64Data) {
                dialogCtrl.loading = true;
                ImageService.saveImage(dialogCtrl.photoBase64Data).then(function success(data) {
                    dialogCtrl.loading = false;
                    dialogCtrl.event.photo_url = data.url;
                    callback();
                });
            } else {
                callback();
            }
        }

        function updateEvent() {
            var event = _.clone(dialogCtrl.dateChangeEvent);
            event = new Event(event, dialogCtrl.user.current_institution.key);
            if(event.isValid()) {
                var patch = generatePatch(jsonpatch.generate(dialogCtrl.observer), event);
                EventService.editEvent(dialogCtrl.event.key, patch).then(function success() {
                    if(dialogCtrl.dateToChange.startTime) {
                        dialogCtrl.event.start_time = event.start_time;
                    }
                    if(dialogCtrl.dateToChange.endTime) {
                        dialogCtrl.event.end_time = event.end_time;
                    }
                    dialogCtrl.closeDialog();
                    MessageService.showToast('Evento editado com sucesso.');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    $state.go("app.user.home");
                });
            } else {
                MessageService.showToast('Evento inválido');
            }
        }

        dialogCtrl.changeDate = function changeDate(typeOfDate) {
            dialogCtrl.dateToChange[typeOfDate] = true;
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

        dialogCtrl.showEventImage = function() {
            var isImageEmpty = dialogCtrl.event.photo_url === "";
            var isImageNull = dialogCtrl.event.photo_url === null;
            var isImageUndefined = dialogCtrl.event.photo_url === undefined;
            return !isImageEmpty && !isImageNull && !isImageUndefined && !dialogCtrl.showImage();
        };

        dialogCtrl.cleanImage = function() {
           dialogCtrl.photoUrl = "";
           dialogCtrl.photoBase64Data = null;
           dialogCtrl.deletePreviousImage = true;
           delete dialogCtrl.event.photo_url;
        };

        function generatePatch(patch, data) {
            if(dialogCtrl.dateToChange.startTime) {
                patch.push({op: 'replace', path: "/start_time", value: data.start_time});
            }
            if(dialogCtrl.dateToChange.endTime) {
                patch.push({op: 'replace', path: "/end_time", value: data.end_time});
            }
            return patch;
        }

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
                    $state.go("app.events");
                });
            } else {
                MessageService.showToast('Evento inválido!');
            }
        }

        (function main() {
            if(dialogCtrl.event) {
                dialogCtrl.dateChangeEvent = _.clone(dialogCtrl.event);
                dialogCtrl.dateChangeEvent.start_time = new Date(dialogCtrl.dateChangeEvent.start_time);
                dialogCtrl.dateChangeEvent.end_time = new Date(dialogCtrl.dateChangeEvent.end_time);
                dialogCtrl.dateChangeEvent = new Event(dialogCtrl.dateChangeEvent, dialogCtrl.user.current_institution.key);
                dialogCtrl.observer = jsonpatch.observe(dialogCtrl.event);
            } else {
                dialogCtrl.event = {};
            }
        })();
    });
})();