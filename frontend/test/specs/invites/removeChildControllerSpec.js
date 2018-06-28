'use strict';

(describe('Test RemoveChildController', function() {
    var removeChildCtrl, httpBackend, createCtrl, state, mdDialog, scope, institutionService, authService;

    var user = new User({});

    var parent = new Institution({});

    var child = new Institution({parent_institution: parent});
    parent.children_institutions = [child];

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state,
        AuthService, $mdDialog, InstitutionService) {
        httpBackend = $httpBackend;
        state = $state;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        institutionService = InstitutionService;
        authService = AuthService;

        AuthService.login(user);

        createCtrl = function() {
            return $controller('RemoveChildController', {
                scope: scope,
                child: child,
                parent: parent,
                InstitutionService: institutionService
            });
        };

        removeChildCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('closeDialog()', function() {
        it('should call cancel', function () {
            spyOn(mdDialog, 'cancel');
            removeChildCtrl.closeDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('removeChildInst', function() {
        it('should call removeInstitution', function () {
            spyOn(institutionService, 'removeInstitution').and.callFake(function() {
              return {
                  then: function(callback) {
                      return callback();
                  }
              };
            });
            spyOn(removeChildCtrl.user, 'removeProfile');
            spyOn(removeChildCtrl.user, 'removeInstitution');
            spyOn(authService, 'save');
            spyOn(removeChildCtrl, 'closeDialog');
            expect(parent.children_institutions.length).toEqual(1);

            removeChildCtrl.removeChildInst();

            expect(institutionService.removeInstitution).toHaveBeenCalled();
            expect(removeChildCtrl.user.removeProfile).toHaveBeenCalled();
            expect(removeChildCtrl.user.removeInstitution).toHaveBeenCalled();
            expect(authService.save).toHaveBeenCalled();
            expect(removeChildCtrl.closeDialog).toHaveBeenCalled();
            expect(parent.children_institutions.length).toEqual(0);
        });
    });
}));