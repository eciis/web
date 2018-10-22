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

        /**
         * Limit the specified string if its size is bigger than the specified limit
         * @param {String} string string that will be limited if necessary
         * @param {Number} limit max string size
         * @returns {String} the sliced string, followed by ellipsis, or the original one
         */
        pdfCtrl.limitString = function(string, limit) {
            return Utils.limitString(string, limit);
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

    /**
     * Function to return a correct template url to show in desktop screen ou mobile screen.
     * @returns {String} The string containing the url path to html file that be displayed in view.
     */
    function getTemplateUrl() {
        return Utils.isMobileScreen() ? "app/post/pdf_view_mobile.html" : "app/post/pdf_view.html";
    };

    app.directive("pdfView", function() {
        return {
            restrict: 'E',
            templateUrl: getTemplateUrl(),
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