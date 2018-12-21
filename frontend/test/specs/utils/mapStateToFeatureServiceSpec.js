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

        it('Should be return true', function() {
            let contain = mapStateToFeatureService.containsFeature('app.edit-inst');
            expect(contain).toBeTruthy();

            contain = mapStateToFeatureService.containsFeature('app.manage-user');
            expect(contain).toBeTruthy();
        });


        it('Should be return false', function() {
            let contain = mapStateToFeatureService.containsFeature('app.manage-inst');
            expect(contain).toEqual(false);
        });
    });
});