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
                    templateUrl: Utils.selectFieldBasedOnScreenSize(
                        'app/post/pdfDialog.html',
                        'app/post/pdfDialogMobile.html',
                    ),
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
            ctrl.pdf = pdf;

            function readPdf() {
                var readablePdf = {};
                PdfService.getReadableURL(pdf.url, setPdfURL, readablePdf).then(function success() {
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
    });

    /**
     * This function return the directive object with the templateUrl passed by parameter.
     * @param {String} templateUrl The url path of the html to the directive.
     * @returns {Object} An object with properties that define the directive.
     */
    function getDirectiveDefinitions(templateUrl) {
        return {
            restrict: 'E',
            templateUrl: templateUrl,
            controllerAs: "pdfCtrl",
            controller: "PdfController",
            scope: {},
            bindToController: {
                pdfFiles: '=',
                isEditing: '='
            }
        }
    }
    app.directive("pdfView", function() {
        return getDirectiveDefinitions("app/post/pdf_view.html");
    });

    app.directive("pdfPreview", function() {
        return getDirectiveDefinitions("app/post/pdf_preview_mobile.html");
    });
})();