'use strict';

describe('Test FeatureToggleService', function() {
    beforeEach(module('app'));

    let featureToggleService, httpBackend;

    const feature = {
        name: 'test-feature',
        enable_mobile: 'ALL',
        enable_desktop: 'DISABLED'
    };

    const otherFeature = {
        name: 'test-other-feature',
        enable_mobile: 'DISABLED',
        enable_desktop: 'ALL'
    };

    beforeEach(inject(function($httpBackend, FeatureToggleService) {
        featureToggleService = FeatureToggleService;
        httpBackend = $httpBackend;

        $httpBackend.whenGET(`/api/feature-toggle?name=${feature.name}`).respond([feature]);
        $httpBackend.whenGET(`/api/feature-toggle?name=${otherFeature.name}`).respond([otherFeature]);
        $httpBackend.whenGET('/api/feature-toggle').respond([feature, otherFeature]);
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Test _getFeature', function() {

        it('Should be return all features', function(done) {
            featureToggleService._getFeatures().then(function(response) {
                expect(response).toEqual([feature, otherFeature]);
                done();
            });
            httpBackend.flush();
        });

        it('Should be return feature test-feature', function(done) {
            featureToggleService._getFeatures(feature.name).then(function(response) {
                expect(response).toEqual([feature]);
                done();
            });
            httpBackend.flush();
        });

        it('Should be return feature test-other-feature', function(done) {
            featureToggleService._getFeatures(otherFeature.name).then(function(response) {
                expect(response).toEqual([otherFeature]);
                done();
            });
            httpBackend.flush();
        });
    });

    describe('Test getAllFeatures', function() {

        it('Should be return all features', function(done) {
            featureToggleService.getAllFeatures().then(function(response) {
                expect(response).toEqual([feature, otherFeature]);
                done();
            });
            httpBackend.flush();
        });
    });

    describe('Test getFeature', function() {
        it('Should be return feature test-feature', function(done) {
            featureToggleService.getFeature(feature.name).then(function(response) {
                expect(response).toEqual([feature]);
                done();
            });
            httpBackend.flush();
        });

        it('Should be return feature test-other-feature', function(done) {
            featureToggleService.getFeature(otherFeature.name).then(function(response) {
                expect(response).toEqual([otherFeature]);
                done();
            });
            httpBackend.flush();
        });
    });


    describe('Test isEnabled', function() {
        it('Should be return true with test-feature', function(done) {
            window.screen = {width: 100};
            featureToggleService.isEnabled(feature.name).then(function(response) {
                expect(response).toBeTruthy();
                done();
            });
            httpBackend.flush();
        });

        it('Should be return true with test-other-feature', function(done) {
            window.screen = {width: 1000};
            featureToggleService.isEnabled(otherFeature.name).then(function(response) {
                expect(response).toBeTruthy();
                done();
            });
            httpBackend.flush();
        });


        it('Should be return false with test-feature', function(done) {
            window.screen = {width: 1000};
            featureToggleService.isEnabled(feature.name).then(function(response) {
                expect(response).toEqual(false);
                done();
            });
            httpBackend.flush();
        });

        it('Should be return false with test-other-feature', function(done) {
            window.screen = {width: 100};
            featureToggleService.isEnabled(otherFeature.name).then(function(response) {
                expect(response).toEqual(false);
                done();
            });
            httpBackend.flush();
        });
    });
});