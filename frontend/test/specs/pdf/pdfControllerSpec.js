'use strict';

(describe('Test PdfController', function() {

    var pdfController, scope, createCtrl, mdDialog;

    var fileExample = new File([''], 'example.pdf');

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, $mdDialog) {
        scope = $rootScope.$new();
        mdDialog = $mdDialog;

        createCtrl = function() {
            return $controller('PdfController',
                {
                    scope: scope,
                });
        };
        pdfController = createCtrl();
        pdfController.pdfFiles = [fileExample];
    }));

    describe('PdfController functions', function() {

        describe('showFiles()', function() {

            it('Should return false if has no files', function() {
                pdfController.pdfFiles = [];
                expect(pdfController.showFiles()).toBeFalsy();
            });

            it('Should return true if has files', function() {
                expect(pdfController.showFiles()).toBeTruthy();
            });
        });

        describe('pdfDialog()', function() {

            it('Should call mdDialog.show() if is not editing', function() {
                pdfController.isEditing = false;
                spyOn(mdDialog, 'show');
                pdfController.pdfDialog("$event", fileExample);
                expect(mdDialog.show).toHaveBeenCalled();
            });

            it('Should not call mdDialog.show() if is editing', function() {
                pdfController.isEditing = true;
                spyOn(mdDialog, 'show');
                pdfController.pdfDialog("$event", fileExample);
                expect(mdDialog.show).not.toHaveBeenCalled();
            });
        });

        describe('hideFile()', function() {
            var indexExample = 0;

            it('Should call deletedFiles.push() if the pdf_files includes selected index', function() {
                pdfController.pdf_files = [fileExample];
                pdfController.deletedFiles = [];
                spyOn(pdfController.deletedFiles, 'push');
                pdfController.hideFile(indexExample);
                expect(pdfController.deletedFiles.push).toHaveBeenCalledWith(fileExample);
            });

            it('Should call only pdfFiles.splice() if the pdf_files not includes selected index', function() {
                pdfController.pdf_files = [];
                spyOn(pdfController.pdfFiles, 'splice');
                pdfController.hideFile(indexExample);
                expect(pdfController.pdfFiles.splice).toHaveBeenCalledWith(indexExample, 1);
            });
        });
    });
}));