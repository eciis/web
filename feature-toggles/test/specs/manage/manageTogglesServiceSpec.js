(describe('ManageTogglesservice Tests', function(){
    beforeEach(module('app'));

    let manageTogglesService, httpService, q, scope;

    const URI = '/api/feature-toggles?lang=pt-br';
    const feature = {
        'name': 'edit-inst'
    };

    const otherFature = {
        'name': 'edit-user'
    };

    beforeEach(inject(function(ManageTogglesService, HttpService, $q, $rootScope) {
        manageTogglesService = ManageTogglesService;
        httpService = HttpService;
        q = $q;
        scope = $rootScope.$new();
    }));

    describe('Test getAllFeaturesToggles', function() {

        it('Should be return all features', function(done) {
            spyOn(httpService, 'get').and.callFake(function() {
                return q.when([feature, otherFature]); 
            });

            manageTogglesService.getAllFeatureToggles().then(function(response) {
                expect(httpService.get).toHaveBeenCalled();
                expect(response).toEqual([feature, otherFature]);
                done();
            });

            scope.$apply();
        });
    });

    describe('Test saveFeatures', function() {
        it('Should be call httpService.put with the feature', function(done) {
            spyOn(httpService, 'put').and.callFake(function(url, feature) {
                return q.when(feature);
            });

            manageTogglesService.saveFeature(feature).then(function(response) {
                expect(httpService.put).toHaveBeenCalledWith(URI, feature);
                expect(response).toEqual(feature);
                done();
            });

            scope.$apply();
        });
    });
}));