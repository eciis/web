'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventPageController", function EventPageController(MessageService, EventService, 
            $state, AuthService, PostService) {
        var eventCtrl = this;

        eventCtrl.event = null;

        eventCtrl.user = AuthService.getCurrentUser();

        var eventKey = $state.params.eventKey;
        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";

        function loadEvent() {
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

        eventCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        eventCtrl.recognizeUrl =  function recognizeUrl(text) {
            if(text){
                var urlsInText = text.match(URL_PATTERN);
                text = addHttpsToUrl(text, urlsInText);
                text = text.replace(URL_PATTERN,REPLACE_URL);
                return text;
            }
        };

        eventCtrl.canDelete = function canDelete() {
            if(eventCtrl.event){
                return eventCtrl.isEventAuthor() || isInstitutionAdmin();
            }
        };

        eventCtrl.isEventAuthor = function isEventAuthor() {
            return getKeyFromUrl(eventCtrl.event.author_key) === eventCtrl.user.key;
        };

        eventCtrl.showImage = function() {
            if(eventCtrl.event){
                console.log(eventCtrl.event);
                var imageEmpty = eventCtrl.event.photo_url === "";
                var imageNull = eventCtrl.event.photo_url === null;
                var deletedPost = eventCtrl.event.state === 'deleted';
                return !imageEmpty && !imageNull && !deletedPost;
            }
        };

        function isInstitutionAdmin() {
            return _.includes(_.map(eventCtrl.user.institutions_admin, getKeyFromUrl),
                getKeyFromUrl(eventCtrl.event.institution_key));
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
            loadEvent();
        })();
    });
})();