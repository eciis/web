"use strict";

(function() {
    var app = angular.module("app");

    app.service("CRUDService", function CRUDService( $q, $firebaseStorage) {
        var service = this;

        service.saveImage = function(file) {
            var deferred = $q.defer();
            var image = firebase.storage().ref("images/" + file.name.split(".")[0]);

            var metadata = {
                contentType: 'image/jpeg'
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