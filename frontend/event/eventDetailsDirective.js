'use strict';
(function () {
    var app = angular.module('app');

    app.controller("EventDetailsController", function EventDetailsController(MessageService, EventService,
        $state, $mdDialog, AuthService) {

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
    });
    
    const event_details_html = 'app/event/event_details.html';
    const event_details_small_page = 'app/event/event_details_small_page.html'
    const screen_width = window.screen.width;

    app.directive("eventDetails", function () {
        return {
            restrict: 'E',
            templateUrl: (screen_width > 600) ? event_details_html : event_details_small_page,
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
