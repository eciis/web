'use strict';

(describe("AnalyseHierarchyRequestControllerSpec", function() {

    beforeEach(module('app'));

    beforeEach(function() {


        // describe('acceptRequest()', function() {
        //     var request;
        //     beforeEach(function() {
        //         spyOn(messageService, 'showConfirmationDialog').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
    
        //         request = {key: 'aosdkopa-ORAOPdaAOSKFP'};
        //     });
    
        //     it('should call acceptInstParentRequest', function() {
        //         spyOn(requestInvitationService, 'acceptInstParentRequest').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
        //         inviteInstHierarchieCtrl.institution.children_institutions = [];
        //         inviteInstHierarchieCtrl.acceptRequest(request, 'REQUEST_INSTITUTION_PARENT', '$event');
        //         expect(messageService.showConfirmationDialog).toHaveBeenCalled();
        //         expect(requestInvitationService.acceptInstParentRequest).toHaveBeenCalled();
        //         expect(request.status).toEqual('accepted');
        //         expect(inviteInstHierarchieCtrl.institution.children_institutions.length).toEqual(1);
        //     });
    
        //     it('should call acceptInstChildrenRequest', function() {
        //         spyOn(requestInvitationService, 'acceptInstChildrenRequest').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
        //         inviteInstHierarchieCtrl.institution.children_institutions = [];
        //         inviteInstHierarchieCtrl.acceptRequest(request, 'REQUEST_INSTITUTION_CHILDREN', '$event');
        //         expect(messageService.showConfirmationDialog).toHaveBeenCalled();
        //         expect(requestInvitationService.acceptInstChildrenRequest).toHaveBeenCalled();
        //         expect(request.status).toEqual('accepted');
        //         expect(inviteInstHierarchieCtrl.institution.parent_institution).toEqual(institution);
        //     });
        // });


        // describe('rejectRequest()', function() {
        //     var request;
        //     beforeEach(function () {
        //         spyOn(messageService, 'showConfirmationDialog').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
    
        //         request = { key: 'aosdkopa-ORAOPdaAOSKFP' };
        //     });
    
        //     it('should call rejectInstParentRequest', function () {
        //         spyOn(requestInvitationService, 'rejectInstParentRequest').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
        //         inviteInstHierarchieCtrl.institution.children_institutions = [];
        //         inviteInstHierarchieCtrl.rejectRequest(request, 'REQUEST_INSTITUTION_PARENT', '$event');
        //         expect(messageService.showConfirmationDialog).toHaveBeenCalled();
        //         expect(requestInvitationService.rejectInstParentRequest).toHaveBeenCalled();
        //         expect(request.status).toEqual('rejected');
        //     });
    
        //     it('should call rejectInstChildrenRequest', function () {
        //         spyOn(requestInvitationService, 'rejectInstChildrenRequest').and.callFake(function () {
        //             return {
        //                 then: function (callback) {
        //                     return callback();
        //                 }
        //             };
        //         });
        //         inviteInstHierarchieCtrl.institution.children_institutions = [];
        //         inviteInstHierarchieCtrl.rejectRequest(request, 'REQUEST_INSTITUTION_CHILDREN', '$event');
        //         expect(messageService.showConfirmationDialog).toHaveBeenCalled();
        //         expect(requestInvitationService.rejectInstChildrenRequest).toHaveBeenCalled();
        //         expect(request.status).toEqual('rejected');
        //     });
        // });
    });
}));
