"use strict";

(function() {
    var app = angular.module('app');

    app.service("PdfService", function PdfService($q, $firebaseStorage) {
        var service = this;
        var fileFolder = "files/";

        service.save = function save(file) {
            var INDEX_FILENAME = 0;
            var INDEX_TYPE_FILE = 1;
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILENAME]  + "-" + (new Date()).getTime();
            var fileReference = firebase.storage().ref(fileFolder + filename);
            var deferred = $q.defer();

            var metadata = {
                contentType: 'file/' + fileProperties[INDEX_TYPE_FILE]
            };

            var uploadTask = $firebaseStorage(fileReference).$put(file, metadata);

            uploadTask.$complete(function(snapshot) {
                var data = {
                    url: snapshot.downloadURL
                };
                deferred.resolve(data);
            });

            uploadTask.$error(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        function isValidPdf(file) {
            var pdfType = "file/pdf";
            var maximumSize = 5242880; // 5Mb in bytes

            if(file) {
                var correctType = file.type === pdfType;
                var correctSize = file.size <= maximumSize;
                return correctType && correctSize;
            }
            return false;
        }
    });
})();