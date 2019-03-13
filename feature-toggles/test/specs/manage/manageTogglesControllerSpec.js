(describe('ManageTogglesConstoller Tests', function() {
    beforeEach(module('app'));

    let authService, messageService, manageTogglesServices, manageTogglesCtrl, q, scope;

    const feature = {
        'name': 'edit-inst'
    };

    const otherFature = {
        'name': 'edit-user'
    };


    beforeEach(inject(function(AuthService, MessageService, ManageTogglesService, $controller, $q, $rootScope) {
        authService = AuthService;
        manageTogglesServices = ManageTogglesService;
        messageService = MessageService;
        q = $q;
        scope = $rootScope.$new();

        manageTogglesCtrl = $controller('ManageTogglesController', {
            AuthService,
            MessageService,
            ManageTogglesService
        });
    }));

    describe('Test $onInit', function() {
        
        it('Should be get all features', function(done) {
            spyOn(manageTogglesServices, 'getAllFeatureToggles').and.callFake(function() {
                return q.when([feature, otherFature]);
            });

            manageTogglesCtrl.$onInit().then(function(response) {
                expect(manageTogglesServices.getAllFeatureToggles).toHaveBeenCalled();
                expect(response).toEqual([feature, otherFature]);
                done();
            });

            scope.$apply();
        });

        it('Should be show error message', function(done) {
            spyOn(messageService, 'showErrorToast');
            spyOn(manageTogglesServices, 'getAllFeatureToggles').and.callFake(function() {
                return q.reject({
                    data: {
                        msg: 'Request fail'
                    }
                });
            });

            manageTogglesCtrl.$onInit().then(function() {
                expect(messageService.showErrorToast).toHaveBeenCalledWith('Request fail');
                done();
            });

            scope.$apply();
        });
    });

    describe('Test logout', function() {

        it('Should be call AuthService.logout', function() {
            spyOn(authService, 'logout');
            manageTogglesCtrl.logout();
            expect(authService.logout).toHaveBeenCalled();
        });
    });

    describe('Test save', function() {
        beforeEach(function() {
            spyOn(messageService, 'showInfoToast');
        });

        it('Should be call messageService.saveFeature', function(done) {
            spyOn(manageTogglesServices, 'saveFeature').and.callFake(function(feature) {
                return q.when(feature);
            });


            const promise = manageTogglesCtrl.save(feature);
            
            expect(feature.isLoading).toBeTruthy();            
            
            promise.then(function(response) {
                expect(messageService.showInfoToast).toHaveBeenCalledWith("Alterações salvas com sucesso.");
                expect(manageTogglesServices.saveFeature).toHaveBeenCalledWith(feature);
                expect(response).toEqual(feature);
                expect(manageTogglesCtrl.isLoading).toBeFalsy();
                done();
            });

            scope.$apply();
        });

        it('Should be call messageService with error message', function(done) {
            spyOn(manageTogglesServices, 'saveFeature').and.callFake(function(feature) {
                return q.reject({
                    data: {
                        msg: 'Feature not found'
                    }
                });
            });

            const promise = manageTogglesCtrl.save(feature);
            
            expect(feature.isLoading).toBeTruthy();            
            
            promise.then(function() {
                expect(messageService.showErrorToast).toHaveBeenCalledWith("Feature not found");
                expect(manageTogglesCtrl.isLoading).toBeFalsy();
                done();
            });

            scope.$apply();
        });
    });
}));