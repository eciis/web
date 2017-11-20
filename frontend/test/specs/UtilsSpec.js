'use strict';

(describe('Test Utils', function() {
	describe('addHttpsToUrl()', function() {

	    it('Should returns a text with https', function() {
	      var text = "Access: www.google.com";
	      var uris = ['www.google.com'];
	      text = Utils.addHttpsToUrl(text, uris);
	      expect(text)
	        .toEqual("Access: http://www.google.com");
	    });
	});

	describe('getKeyFromUrl()', function() {

	    it('Should returns a key', function() {
	      var url_key = "http://domain/api/key/aghkZXZ-Tm9uZXIYCxILSW5zdGl0dXRpb24YgICAgIDovQsM";
	      url_key = Utils.getKeyFromUrl(url_key);
	      expect(url_key)
	        .toEqual("aghkZXZ-Tm9uZXIYCxILSW5zdGl0dXRpb24YgICAgIDovQsM");
	    });
	});

	describe('recognizeUrl()', function() {

	    it('Should returns a text with href', function() {
	      var text = "Access: http://www.google.com";
	      text = Utils.recognizeUrl(text);
	      expect(text)
	        .toEqual("Access: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
	    });
	});

	describe('calculateHeight()', function() {
		it('should set the height to 20em', function() {
			var requests = ['req01', 'req02', 'req03', 'req05', 'req06'];
			var calculatedHeigh = Utils.calculateHeight(requests);
			var expectedHeight = {height: '20em'};
			expect(calculatedHeigh).toEqual(expectedHeight);
		});

		it('should set height to less than 20em', function() {
			var requests = ['req01', 'req02', 'req03'];
			var calculatedHeigh = Utils.calculateHeight(requests);
			var expectedHeight = {height: '15em'};
			expect(calculatedHeigh).toEqual(expectedHeight);
		});

		it('should set height to 30em', function() {
			var requests = ['req01', 'req02', 'req03', 'req05', 'req06'];
			var calculatedHeigh = Utils.calculateHeight(requests, 10, 3);
			var expectedHeight = {height: '30em'};
			expect(calculatedHeigh).toEqual(expectedHeight);
		});
	});
}));


