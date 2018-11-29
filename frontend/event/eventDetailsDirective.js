'use strict';
(function () {
    var app = angular.module('app');

    app.controller("EventDetailsController", function EventDetailsController(MessageService, EventService,
        $state, $mdDialog, AuthService, STATES) {

        var eventCtrl = this;

        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;
        eventCtrl.showImage = true;
        
        eventCtrl.share = function share(ev, event) {
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: 'app/post/share_post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    user: eventCtrl.user,
                    post: event,
                    addPost: false
                }
            });
        };

        eventCtrl.confirmDeleteEvent = function confirmDeleteEvent(ev, event) {
            var dialog = MessageService.showConfirmationDialog(ev, 'Excluir Evento', 'Este evento será removido.');
            dialog.then(function () {
                deleteEvent(event);
            }, function () {
                MessageService.showToast('Cancelado');
            });
        };

        function deleteEvent(event) {
            let promise = EventService.deleteEvent(event);
            promise.then(function success() {
                MessageService.showToast('Evento removido com sucesso!');
                eventCtrl.event.state = "deleted";
            });
            return promise;
        }

        eventCtrl.recognizeUrl = function recognizeUrl(text) {
            if (text) {
                return Utils.recognizeUrl(text);
            }
        };

        eventCtrl.canChange = function canChange(event) {
            if(event) {
                const hasInstitutionPermission = eventCtrl.user.hasPermission('remove_posts', event.institution_key);
                const hasEventPermission = eventCtrl.user.hasPermission('remove_post', event.key);
                return hasInstitutionPermission || hasEventPermission;
            }
        };

        eventCtrl.canEdit = function canEdit(event) {
            return eventCtrl.user.hasPermission('edit_post', event.key);
        };

        eventCtrl.editEvent = function editEvent(ev, event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'app/event/event_dialog.html',
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    event: _.clone(event),
                    isEditing: true
                },
                bindToController: true
            }).then(function success(event){
                (event && event.title && eventCtrl.event !== event) ?  
                    eventCtrl.event = event : null;
                eventCtrl.showImage = hasImage(event);
            })
        };

        function hasImage(event) {
            var emptyPhoto = event && event.photo_url == "";
            var nullPhoto = event && event.photo_url == null;
            return !(emptyPhoto || nullPhoto);
        }

        eventCtrl.isEventAuthor = function isEventAuthor(event) {
            return event && (event.author_key === eventCtrl.user.key);
        };

        eventCtrl.goToEvent = function goToEvent(event) {
            $state.go('app.user.event', { eventKey: event.key, posts: eventCtrl.posts });
        };

        eventCtrl.endInOtherMonth = function endInOtherMonth() {
            if (eventCtrl.event) {
                const startMonth = new Date(eventCtrl.event.start_time).getMonth();
                const endMonth = new Date(eventCtrl.event.end_time).getMonth();
                return startMonth !== endMonth;
            }
        };

        eventCtrl.getVideoUrl = function getVideoUrl(video_url) {
            if (video_url) {
                var params = _.split(video_url, '=');
                var id = params[params.length - 1];
                return 'https://www.youtube.com/embed/' + id;
            }
        };

        eventCtrl.getOfficialSite = function getOfficialSite() {
            if(eventCtrl.event)
                return Utils.limitString(eventCtrl.event.official_site, 80);
        };

        eventCtrl.endInTheSameDay = function endInTheSameDay() {
            if (eventCtrl.event) {
                const startDay = new Date(eventCtrl.event.start_time).toLocaleDateString();
                const endDay = new Date(eventCtrl.event.end_time).toLocaleDateString();
                return startDay === endDay;
            }
        };

        eventCtrl.isDeleted = () => {
            return eventCtrl.event ? eventCtrl.event.state === 'deleted' : true;
        }

        /**
         * This function receives a date in iso format, 
         * for example, 2018-11-15T19: 41: 11.545Z, and 
         * returns the corresponding time for that date.
         * 
         * @param {String} isoTime String date in iso format
         */
        eventCtrl.getTimeHours = function getTimeHours(isoTime) {
            return new Date(isoTime).getHours();
        };

        /**
         * This function receives the event key, makes a 
         * request to the backend, and returns the event 
         * returned as a backend response.
         * 
         * @param {String} eventKey Key of event 
         */
        function loadEvent(eventKey) {
            return EventService.getEvent(eventKey).then(function success(response) {
                eventCtrl.event = response;
            }, function error(response) {
                MessageService.showToast(response);
                $state.go(STATES.HOME);
            });
        }

        eventCtrl.$onInit = function() {
            if ($state.params.eventKey)
                return loadEvent($state.params.eventKey);
        };
    });

    app.directive("eventDetails", function () {
        return {
            restrict: 'E',
            templateUrl: "app/event/event_details.html",
            controllerAs: "eventDetailsCtrl",
            controller: "EventDetailsController",
            scope: {},
            bindToController: {
                event: '=',
                isEventPage: '='
            }
        };
    });
})();
