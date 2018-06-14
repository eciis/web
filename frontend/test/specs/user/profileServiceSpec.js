'use strict';

(describe('Test ProfileService', function() {

    var httpBackend, mdDialog, profileService;

    beforeEach(module('app'));

    beforeEach(inject(function($mdDialog, $httpBackend, ProfileService) {
        mdDialog = $mdDialog;
        httpBackend = $httpBackend;
        profileService = ProfileService;
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('showProfile()', function() {

        it('should call mdDialog.show()', function() {
            spyOn(mdDialog, 'show');
            var userKey ='pkasdok24Psakd';
            profileService.showProfile(userKey, '$event');
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));