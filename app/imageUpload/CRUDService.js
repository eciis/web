"use strict";

(function() {
    var app = angular.module("app");

    app.service("CRUDService", function CRUDService( $q, $firebaseStorage) {
        var service = this;
        var folderImages = 'images/';

        service.saveImage = function(file) {
            var INDEX_FILENAME = 0;
            var INDEX_TYPE_FILE = 1;
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILENAME]  + "-" + (new Date()).getTime();
            var image = firebase.storage().ref(folderImages + filename);
            var deferred = $q.defer();

            var metadata = {
                contentType: 'image/' + fileProperties[INDEX_TYPE_FILE]
            };

            var promise = $firebaseStorage(image).$put(file, metadata);

            promise.$complete(function(snapshot) {
                var data = {
                    url: snapshot.downloadURL
                };
                deferred.resolve(data);
            });

            promise.$error(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };
    });
})();