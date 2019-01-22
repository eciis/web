'use strict';

(describe('Test utils', () => {

    describe('getIndexesOf()', function () {

        it('should return the indexes where the substring X appear', function () {
            const string = 'test X substring X other X';
            const substring = 'X';
            const indexes = Utils.getIndexesOf(substring, string);
            expect(indexes).toEqual([5,17,25]);
        });
    });

    describe('limitString()', function () {
        const stringToLimit = 'Just a string too long';

        it('should shourten the strign and add ellipsis at the end', function () {
            const ellipsis = '...';
            const limitedString = Utils.limitString(stringToLimit, stringToLimit.length / 2);
            const expectedString = stringToLimit.substring(0, stringToLimit.length / 2 + 1) + ellipsis;
            expect(limitedString).toEqual(expectedString);
        });

        it('should not limit the string', function () {
            const limitedString = Utils.limitString(stringToLimit, stringToLimit.length + 1);
            expect(limitedString).toEqual(stringToLimit);
        });
    });

}));