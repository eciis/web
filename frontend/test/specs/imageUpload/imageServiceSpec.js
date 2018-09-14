(describe("Image Service Test", function() {
    "use strict";

    let imageService, rootScope; 
    let isTestUploadSuccess = true;

    const url = "dhkasjhDHLKHDkjhakjhdkjahdkjhaskjdhakjhdlkjhsakjdfahfkjl";
    const failMessage = "Error! upload fail";
    
    const file = {
        name: "test.jpg"
    };

    const snaphot = {
        ref: {
            getDownloadURL: () => {
                return {
                    then: (callback) => callback(url)
                };
            }
        }
    };

    const uploadSuccess = {
        $complete: callback => callback(snaphot),
        $error: () => {}
    };

    const uploadFail = {
        $complete: () => {},
        $error: callback => callback(failMessage)
    };

    const firebaseMock = () => {
        return {
            $put: () => (isTestUploadSuccess) ? uploadSuccess : uploadFail
        };
    };

    const firebaseStorage = function () {
        return firebaseMock;
    };

    beforeEach(module("app"));

    beforeEach(module(function($provide) {
        $provide.service('$firebaseStorage', firebaseStorage);
    }));

    beforeEach(inject(function(ImageService, $rootScope) {
        imageService = ImageService;
        rootScope = $rootScope;
    }));

    describe("Test saveImeage()", function() {
        
        it("Test upload success", function(done) {
            imageService.saveImage(file).then(function(data) {
                expect(data).toEqual({url: url});
                done();
            });
            rootScope.$apply();
        });

        it("Test fail upload", function(done) {
            isTestUploadSuccess = false;

            imageService.saveImage(file).then(function success() {
            }, function error(message) {
                expect(message).toEqual(failMessage);
                done();
            });
            rootScope.$apply();
        });
    });
}));