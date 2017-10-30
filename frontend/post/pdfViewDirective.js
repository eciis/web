(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PdfController', function PdfController(PdfService, $mdDialog, $sce) {
        var pdfCtrl = this;     

        pdfCtrl.showFiles = function() {
            var hasFiles = pdfCtrl.pdfFiles.length > 0;
            return hasFiles;
        };

        pdfCtrl.pdfDialog = function(ev, pdf) {
            var readablePdf = {};
            PdfService.getReadableURL(pdf.url, setPdfURL, readablePdf).then(
                function success() {
                    $mdDialog.show({
                        templateUrl: 'app/post/pdfDialog.html',
                        targetEvent: ev,
                        clickOutsideToClose:true,
                        locals: {
                            pdfUrl: readablePdf.url
                        },
                        controller: DialogController,
                        controllerAs: 'ctrl'
                    });
                });
        };

        pdfCtrl.hideFile = function(index) {
            if (_.includes(pdfCtrl.pdf_files, pdfCtrl.pdfFiles[index])) {
                pdfCtrl.deletedFiles.push(pdfCtrl.pdfFiles[index]);
            }
            pdfCtrl.pdfFiles.splice(index, 1);
        };


        function setPdfURL(url, pdf) {
            pdf.url = url;
        }

        function DialogController($mdDialog, pdfUrl) {
            var ctrl = this;
            var trustedUrl = $sce.trustAsResourceUrl(pdfUrl);
            ctrl.pdfUrl = trustedUrl;
        }
    });

    app.directive("pdfView", function() {
            return {
                restrict: 'E',
                templateUrl: "app/post/pdf_view.html",
                controllerAs: "pdfCtrl",
                controller: "PdfController",
                scope: {},
                bindToController: {
                    pdfFiles: '=',
                    isEditing: '='
                }
            };
        });
})();