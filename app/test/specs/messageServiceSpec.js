'use strict';

(describe('Test MessageService', function () {
        var httpBackend, service, mdToast;

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, MessageService, $mdToast) {
            httpBackend = $httpBackend;
            mdToast = $mdToast;
            service = MessageService;
        }));

        describe("showToast", function() {

            it('should call mdToast.show', function() {
                spyOn(mdToast, 'show').and.callThrough();
                service.showToast("");
                expect(mdToast.show).toHaveBeenCalled();
            });
        });
}));