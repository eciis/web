'use strict';

(describe('Test RequestInvitationService', function () {
    const INST_REQUEST_URI = "/api/institutions/";
    const REQUEST_URI = "/api/requests/";
    
    var service, http, mdDialog, q;

    beforeEach(module('app'));

    beforeEach(inject(function (RequestInvitationService, $http, $mdDialog, $q) {
        service = RequestInvitationService;
        http = $http;
        mdDialog = $mdDialog;
        q = $q;
    }));

    describe('Test analyseReqDialog', function () {
        var requestedInstitution, request, event, promiseData;

        beforeEach(function () {
            requestedInstitution = new Institution();
            request = new Invite();
            event = {};
            promiseData = Promise.resolve({});
            spyOn(mdDialog, 'show').and.returnValue(Promise.resolve(promiseData));
        });
        
        it('should show a dialog with the expected properties', function () {
            var promise = service.analyseReqDialog(event, requestedInstitution, request);
            var dialogData = {
                controller: 'AnalyseHierarchyRequestController',
                controllerAs: 'analyseHierReqCtrl',
                templateUrl: 'app/requests/analyse_hierarchy_request_dialog.html',
                targetEvent: event,
                locals: {
                    requestedInstitution: requestedInstitution,
                    request: request
                }
            };
            expect(mdDialog.show).toHaveBeenCalledWith(dialogData);
            expect(promise).toEqual(promiseData);
        });
    });
}));