(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PdfController', function PdfController($mdDialog) {
        var pdfCtrl = this;     

        pdfCtrl.showFiles = function() {
            var hasFiles = pdfCtrl.pdfFiles.length > 0;
            return hasFiles;
        };

        pdfCtrl.pdfDialog = function(ev, pdf) {
            if(!pdfCtrl.isEditing) {
                $mdDialog.show({
                    templateUrl: 'app/post/pdfDialog.html',
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    locals: {
                        pdf: pdf
                    },
                    controller: DialogController,
                    controllerAs: 'ctrl'
                });
            }
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

        function DialogController($mdDialog, PdfService, $sce, pdf) {
            var ctrl = this;
            ctrl.pdfUrl = "";
            ctrl.isLoadingPdf = true;

            function readPdf() {
                var readablePdf = {};
                PdfService.getReadableURL(pdf.url, setPdfURL, readablePdf).then(function success() {
                    var trustedUrl = $sce.trustAsResourceUrl(readablePdf.url);
                    ctrl.pdfUrl = trustedUrl;
                    ctrl.isLoadingPdf = false;
                });
            }

            (function main() {
                readPdf();
            })();
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