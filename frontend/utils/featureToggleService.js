(function() {
    'use strict';

    const app = angular.module('app');

    app.service('FeatureToggleService', function FeatureToggleService(HttpService) {
        const service = this;
        const uri = '/api/feature-toggle';

        service.getFeatures = function getFeatures(feature_name) {
            const query = (feature_name) ? `?name=${feature_name}` : '';
            return HttpService.get(`${uri}${query}`);
        };

        service.isEnabled = function isEnabled(feature_name) {
            return service.getFeatures(feature_name).then(function(response) {
                const feature = response[0];
                const disabledMobile = feature.enable_mobile === 'DISABLED';
                const disabeldDesktop = feature.enable_desktop === 'DISABLED';
                
                if (disabledMobile && disabeldDesktop)
                    return false;

                return !disabeldDesktop && !Utils.isMobileScreen() || !disabledMobile && Utils.isMobileScreen();
            });
        };
    });
})();