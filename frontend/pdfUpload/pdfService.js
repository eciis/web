"use strict";

(function() {
    var app = angular.module('app');

    app.service("PdfService", function PdfService($q, $firebaseStorage, $http, $mdDialog) {
        var service = this;
        var fileFolder = "files/";
        var INDEX_FILE_NAME = 0;
        var INDEX_FILE_TYPE = 1;
        var PDF_TYPE = "application/pdf";
        var MAXIMUM_SIZE = 5242880; // 5Mb in bytes

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
                });
            }
            
            var filename = createFileName(file);
            var storageRef = firebase.storage().ref();
            var fileReference = storageRef.child(fileFolder + filename);
            var metadata = { contentType: 'file/pdf' };
            var uploadTask = $firebaseStorage(fileReference).$put(file, metadata);

            uploadTask.$complete(function(snapshot) {
                snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    var data = {
                        url: downloadURL
                    };
                    deferred.resolve(data);
                });
            });

            uploadTask.$error(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        function createFileName(file) {
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILE_NAME]  + "-" + (new Date()).getTime() + "." + fileProperties[INDEX_FILE_TYPE];
            return filename;
        }

        service.deleteFile = function deleteFile(fileURL) {
            var deferred = $q.defer();
            var storage = firebase.storage().refFromURL(fileURL);
            storage.delete().then(function success() {
                deferred.resolve();
            }, function error(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        service.getReadableURL = function getReadableURL(url, callback, pdf) {
            var deferred = $q.defer();
            $http.get(url, {responseType:'arraybuffer'}).then(function success(response) {
                var blob = new Blob([response.data], {type:'application/pdf'});
                var url = URL.createObjectURL(blob);
                callback(url, pdf);
                deferred.resolve(response);
            }, function error() {
                deferred.reject();
            });
            return deferred.promise;
        };

        service.download = function download (url) {
            var link = document.createElement('a');
            link.href = url;
            link.click();
        };

        function isValidPdf(file) {
            if(file) {
                var correctType = file.type === PDF_TYPE;
                var correctSize = file.size <= MAXIMUM_SIZE;
                return correctType && correctSize;
            }
            return false;
        }

        service.showPdfDialog = function showPdfDialog (ev, pdf) {
            $mdDialog.show({
                templateUrl: Utils.selectFieldBasedOnScreenSize(
                    'app/post/pdfDialog.html',
                    'app/post/pdfDialogMobile.html'
                ),
                targetEvent: ev,
                clickOutsideToClose:true,
                locals: {
                    pdf: pdf
                },
                controller: PdfDialogController,
                controllerAs: 'ctrl'
            });
        };

        function PdfDialogController($mdDialog, PdfService, $sce, pdf) {
            var ctrl = this;
            ctrl.pdfUrl = "";
            ctrl.isLoadingPdf = true;
            ctrl.pdf = pdf;

            function readPdf() {
                var readablePdf = {};
                service.getReadableURL(pdf.url, setPdfURL, readablePdf).then(function success() {
                    var trustedUrl = $sce.trustAsResourceUrl(readablePdf.url);
                    ctrl.pdfUrl = trustedUrl;
                    ctrl.isLoadingPdf = false;
                });
            }

            ctrl.downloadPdf = () => {
                PdfService.download(ctrl.pdf.url);
            };

            (function main() {
                if (!Utils.isMobileScreen()) readPdf();
            })();
        }

        function setPdfURL(url, pdf) {
            pdf.url = url;
        }

    });
})();