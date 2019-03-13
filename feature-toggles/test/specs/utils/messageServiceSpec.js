'use strict';

(describe('Test MessageService', function () {
        var httpBackend, service, mdToast;

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, MessageService, $mdToast) {
            httpBackend = $httpBackend;
            mdToast = $mdToast;
            service = MessageService;
        }));

        describe("showInfoToast", function() {
            it('should call mdToast.show', function() {
                window.screen = { width: 2000 };
                spyOn(mdToast, 'show').and.callThrough();
                service.showInfoToast("");
                expect(mdToast.show).toHaveBeenCalled();
            });

            it('should not call mdToast.show', function() {
                window.screen = { width: 200 };
                spyOn(mdToast, 'show').and.callThrough();
                service.showInfoToast("");
                expect(mdToast.show).not.toHaveBeenCalled();
            });
        });

        describe("showErrorToast", function() {
            it('should call mdToast.show', function() {
                window.screen = { width: 2000 };
                spyOn(mdToast, 'show').and.callThrough();
                service.showErrorToast("");
                expect(mdToast.show).toHaveBeenCalled();
            });

            it('should not call mdToast.show', function() {
                window.screen = { width: 200 };
                spyOn(mdToast, 'show').and.callThrough();
                service.showErrorToast("");
                expect(mdToast.show).toHaveBeenCalled();
            });
        });
}));