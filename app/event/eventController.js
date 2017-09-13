'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(MessageService, AuthService, ImageService,
                     $rootScope, mdcDateTimeDialog, EventService, $state, PostService) {
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

        eventCtrl.share = function share(event) {
            var post = new Post({}, eventCtrl.user.current_institution.key);
            post.shared_event = event.key;
            PostService.createPost(post).then(function success() {
                MessageService.showToast('Evento compartilhado com sucesso!');
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });

        };

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
            var isDateStartUndefined = eventCtrl.event.start_time === undefined;
            var isDateEndUndefined = eventCtrl.event.end_time === undefined;
            return !isTitleUndefined && !isLocalUndefined &&
                    !isDateStartUndefined && !isDateEndUndefined;
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

        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";
        var LIMIT_CHARACTERS = 150;

        /**
        * replace urls in a string with links to make the urls clickable.
        * If urls don't containing http or https, this function add the https.
        * @param {object} receivedPost - The post to be recognized.
        * @return {object} The post with clickable urls.
        * OBS: This function returns a new Post because this result is only for show in view.
        * It is not necessary to change the original Post.
        */
        eventCtrl.recognizeText =  function recognizeText(text) {
            var urlsInText = text.match(URL_PATTERN);
            text = addHttpsToUrl(text, urlsInText);
            text = adjustText(text);
            return text;
        };

        eventCtrl.isLongText = function(text){
            if(text){
                var qtdChar = text.length;
                return qtdChar >= LIMIT_CHARACTERS;
            }
        };

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

        loadEvents();
    });
})();