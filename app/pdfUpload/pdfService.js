"use strict";

(function() {
    var app = angular.module('app');

    app.service("PdfService", function PdfService($q, $firebaseStorage) {
        var service = this;
        var fileFolder = "files/";

        service.save = function save(file, currentUrl) {
            var deferred = $q.defer();

            if(!isValidPdf(file)) {
                deferred.reject("O arquivo deve ser um pdf menor que 5 Mb");
                return deferred.promise;
            }

            if(currentUrl) {
                var currentFileRef = firebase.storage().refFromURL(currentUrl);
                currentFileRef.delete().then(function success() {
                }, function error() {
                    return deferred.promise;
                })
            }

            var INDEX_FILE_NAME = 0;
            var INDEX_FILE_TYPE = 1;
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILE_NAME]  + "-" + (new Date()).getTime() + "." + fileProperties[INDEX_FILE_TYPE];
            var storageRef = firebase.storage().ref();
            var fileReference = storageRef.child(fileFolder + filename);

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

        service.readFile = function readFile(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function createFile(event) {
                var source_file_obj = new File([""], file.name);

                source_file_obj.onload = function() {
                    callback(source_file_obj);
                }
                source_file_obj.src = event.target.result;
            }
            fileReader.readAsDataURL(file);
        }

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