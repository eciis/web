'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventPageController", function EventPageController(MessageService, EventService, 
            $state, AuthService, PostService) {
        var eventCtrl = this;

        eventCtrl.event = null;
        eventCtrl.user = AuthService.getCurrentUser();

        function loadEvent(eventKey) {
            EventService.getEvent(eventKey).then(function success(response) {
                eventCtrl.event = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                $state.go('app.home');
            });
        }

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
            var dialog = MessageService.showConfirmationDialog(ev, 'Excluir Evento', 'Este evento será removido.');
            dialog.then(function() {
                EventService.deleteEvent(event).then(function success() {
                event.state = 'deleted';
                MessageService.showToast('Evento removido com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        eventCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        eventCtrl.recognizeUrl =  function recognizeUrl(text) {
            if(text){
                return utils.recognizeUrl(text);
            }
        };

        eventCtrl.showButtonDelete = function(){
            return eventCtrl.canDelete() && !eventCtrl.isDeleted();
        };

        eventCtrl.canDelete = function canDelete() {
            if(eventCtrl.event){
                return isEventAuthor() || isInstitutionAdmin();
            }
        };

        eventCtrl.showImage = function() {
            if(eventCtrl.event){
                var imageEmpty = eventCtrl.event.photo_url === "";
                var imageNull = eventCtrl.event.photo_url === null;
                var deletedPost = eventCtrl.event.state === 'deleted';
                return !imageEmpty && !imageNull && !deletedPost;
            }
        };

        eventCtrl.isDeleted = function(){
            if(eventCtrl.event){
                return eventCtrl.event.state == 'deleted';
            }
        };

        function isEventAuthor() {
            return utils.getKeyFromUrl(eventCtrl.event.author_key) === eventCtrl.user.key;
        }

        function isInstitutionAdmin() {
            return _.includes(_.map(eventCtrl.user.institutions_admin, utils.getKeyFromUrl),
                utils.getKeyFromUrl(eventCtrl.event.institution_key));
        }

        (function main() {
            loadEvent($state.params.eventKey);
        })();
    });
})();