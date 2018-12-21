'use strict';


describe('MapStateToFeatureService Test', function() {
    beforeEach(module('app'));

    let mapStateToFeatureService;

    beforeEach(inject(function(MapStateToFeatureService) {
        mapStateToFeatureService = MapStateToFeatureService;

        mapStateToFeatureService._statesToFeature = {
            'app.manage-user': 'manage-user',
            'app.edit-inst': 'edit-inst'
        };
    }));

    describe('Test getFeatureByState', function() {

        it('Should be return feature', function() {
            let feature = mapStateToFeatureService.getFeatureByState('app.manage-user');
            expect(feature).toEqual('manage-user');

            feature = mapStateToFeatureService.getFeatureByState('app.edit-inst');
            expect(feature).toEqual('edit-inst');
        });

        it('Should be return undefined with unregistred state', function() {
            let feature = mapStateToFeatureService.getFeatureByState('app.manage-inst');
            expect(feature).toBeUndefined();
        });
    });

    describe('Test containsFeature', function() {

        
    });
});