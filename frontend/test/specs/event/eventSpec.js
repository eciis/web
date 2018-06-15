'use strict';

(describe('Test event model', function() {

    var eventData;
    var institution_key = 'djsahdkjhas-ahgssdasdAJJDHASJKHAHSA';
    var start_time = new Date();
    var end_time = new Date(); end_time.setYear(start_time.getFullYear() + 3);
    var sizeDate = 19;

    beforeEach(function() {
        eventData = {
            title: 'event test',
            local: 'test',
            start_time,
            end_time
        };
    });

    describe('Test isValid()', function() {

        it('Should be valid', function() {
            var event = new Event(eventData, institution_key);
            expect(event.isValid()).toBeTruthy();
        });

        it('Should be invalid because of title', function() {
            delete eventData['title'];
            var event = new Event(eventData, institution_key);
            expect(event.isValid()).toBeFalsy();
        });

        it('Should be invalid because of local', function() {
            delete eventData['local'];
            var event = new Event(eventData, institution_key);
            expect(event.isValid()).toBeFalsy();
        });

        it('Should be invalid because of institution_key', function() {
            var event = new Event(eventData, institution_key);
            delete event.institution_key;
            expect(event.isValid()).toBeFalsy();
        });
    });

    describe('Test convertDate()', function() {

        it('Should convert date', function() {
            var start_time_conv = (start_time.toISOString()).substring(0, sizeDate);
            var end_time_conv = (end_time.toISOString()).substring(0, sizeDate);
            var event = new Event(eventData, institution_key);

            expect(event.start_time).toEqual(start_time_conv);
            expect(event.end_time).toEqual(end_time_conv);
        });
    });
}));