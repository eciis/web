"use strict";

(function() {
    var app = angular.module('app');

    app.service("PdfService", function PdfService($q, $firebaseStorage) {
        var service = this;
        var fileFolder = "files/";

        service.save = function save(file) {
            var deferred = $q.defer();

            if(!isValidPdf(file)) {
                deferred.reject("O arquivo deve ser um pdf menor que 5 Mb");
                return deferred.promise;
            }

            var INDEX_FILE_NAME = 0;
            var INDEX_FILE_TYPE = 1;
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILE_NAME]  + "-" + (new Date()).getTime() + "." + fileProperties[INDEX_FILE_TYPE];
            var fileReference = firebase.storage().ref(fileFolder + filename);

            var metadata = {
                contentType: 'file/' + fileProperties[INDEX_FILE_TYPE]
            };
            // TODO: delete current portfolio if exists before adding a new one
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
            var pdfType = "application/pdf";
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