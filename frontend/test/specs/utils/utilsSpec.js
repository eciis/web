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
	
	describe('getIndexesOf()', function () {

		it('should return the indexes where the substring X appear', function () {
			var string = 'test X substring X other X';
			var substring = 'X';
			var indexes = Utils.getIndexesOf(substring, string);
			expect(indexes).toEqual([5,17,25]);
		});
	});

	describe('limitString()', function () {
		var stringToLimit = 'Just a string too long';

		it('should shourten the strign and add ellipsis at the end', function () {
			var ellipsis = '...';
			var limitedString = Utils.limitString(stringToLimit, stringToLimit.length / 2);
			var expectedString = stringToLimit.substring(0, stringToLimit.length / 2 + 1) + ellipsis;
			expect(limitedString).toEqual(expectedString);
		});

		it('should not limit the string', function () {
			var limitedString = Utils.limitString(stringToLimit, stringToLimit.length + 1);
			expect(limitedString).toEqual(stringToLimit); 
		});
	});

	describe('generateLink()', function () {

		it('should generate a link based on the current host', function () {
			var url = "some/resource/key";
			var expectedLink = window.location.host + url;
			expect(Utils.generateLink(url)).toEqual(expectedLink);
		});
	});

	describe('validateEmail()', function () {

		it('should validate emails correctly', function () {
			expect(Utils.validateEmail('test@email.com')).toBeTruthy();
			expect(Utils.validateEmail('t1231@email.com')).toBeTruthy();
			expect(Utils.validateEmail('test.ttt@email.com')).toBeTruthy();
			expect(Utils.validateEmail('test@email.com.')).toBeFalsy();
			expect(Utils.validateEmail('1test@email.com.')).toBeFalsy();
			expect(Utils.validateEmail('testemail.com')).toBeFalsy();
			expect(Utils.validateEmail('test@@email.com')).toBeFalsy();
		});
	});

	describe('normalizeString', function () {

		it('should remove special chars from input string', function () {
			expect(Utils.normalizeString('É ÀDD ÕDD ÇÇÇ')).toEqual('e add odd ccc');
			expect(Utils.normalizeString('11451 aaddfff')).toEqual('11451 aaddfff');
		});
	});

	describe("isLargerThanTheScreen()", function () {
		const generateString = size => (new Array(size)).join('x');

		describe("Test for small screen size", function () {
			var width = 380;

			it("should be false", function () {
				var string = generateString(20);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeFalsy();
			});
			
			it("should be true", function () {
				var string = generateString(21);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeTruthy();
			});
		});

		describe("Test for medium screen size", function () {
			var width = 640;
			
			it("should be false", function () {
				var string = generateString(41);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeFalsy();
			});

			it("should be true", function () {
				var string = generateString(42);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeTruthy();
			});
		});

		describe("Test for large screen size", function () {
			var width = 840;
			
			it("should be false", function () {
				var string = generateString(57);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeFalsy();
			});

			it("should be true", function () {
				var string = generateString(58);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeTruthy();
			});
		});

		describe("Test for extra large screen size", function () {
			var width = 940;
			
			it("should be false", function () {
				var string = generateString(63);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeFalsy();
			});

			it("should be true", function () {
				var string = generateString(64);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeTruthy();
			});
		});

		describe("Test for greater than extra large screen size", function () {
			var width = 941;
			
			it("should be false", function () {
				var string = generateString(59);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeFalsy();
			});

			it("should be true", function () {
				var string = generateString(60);
				expect(Utils.isLargerThanTheScreen(string, width)).toBeTruthy();
			});
		});
	});

	describe('clearArray()', function () {

		it('should clear array', function () {
			const emptyArray = [];
			const elementsArray = ["element1", "element2"];

			Utils.clearArray(emptyArray);
			Utils.clearArray(elementsArray);
			expect(emptyArray.length === 0).toBeTruthy();
			expect(elementsArray.length === 0).toBeTruthy();			
		});
	});

	describe('selectHtmlBasedOnScreenSize', () => {
		it('should return the second parameter when isMobileScreen returns true', () => {
			spyOn(Utils, 'isMobileScreen').and.returnValue(true);
			const selectedHtml = Utils.selectHtmlBasedOnScreenSize('notMobile.html', 'mobile.html');
			expect(selectedHtml).toBe('mobile.html');
		});

		it('should return the second first when isMobileScreen returns false', () => {
			spyOn(Utils, 'isMobileScreen').and.returnValue(false);
			const selectedHtml = Utils.selectHtmlBasedOnScreenSize('notMobile.html', 'mobile.html');
			expect(selectedHtml).toBe('notMobile.html');
		});
	});
}));


