'use strict';

(describe('Test event model', function() {

    var eventData;
    var institution_key = 'djsahdkjhas-ahgssdasdAJJDHASJKHAHSA';

    beforeEach(function() {
        eventData = {
            title: 'event test',
            local: 'test',
            start_time: new Date(),
            end_time: new Date()
        };
    });

    describe('Test isValid', function() {

        fit('Should be valid', function() {
            var event = new Event(eventData, institution_key);
            expect(event.isValid()).toBeTruthy();
        });
    });
}));