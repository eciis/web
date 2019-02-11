'use strict';

(describe('Test Utils', function() {
	describe('updateBackendUrl', function () {

		it('should replace the original domain by the local one', function () {
			var localDomain = Config.BACKEND_URL;
			var otherDomain = 'http://www.other-url';
			var apiResource = '/api/some/resource';
			var config = { url: otherDomain + apiResource };
			Utils.updateBackendUrl(config);
			expect(config.url).toEqual(localDomain + apiResource);
		});
	});	
	
}));


