"use strict";

const Utils = {

    /**
     * Identify all the indexes where a substring occurs inside another string
     * @param {string} substring to be searched
     * @param {string} fullString that contains the searched substring
     * @returns {[number]} a list of indexes where the substring occurs
     */
    getIndexesOf : function getIndexesOf(substring, fullString) {
        const indexes = [];
        if (substring.length !== 0) {
            let startIndex = 0, index;
            while((index = fullString.indexOf(substring, startIndex)) > -1) {
                indexes.push(index);
                startIndex = index + substring.length;
            }
        }
        return indexes;
    },

    /**
     * Limit the specified string if its size is bigger than the specified limit
     * @param {string} stringToLimit string that will be limited if necessary
     * @param {number} limit max string size
     * @returns {string} the sliced string, followed by ellipsis, or the original one
     */
    limitString : function limitString(stringToLimit, limit) {
        if(stringToLimit && stringToLimit.length > limit) {
            const undefinedIndex = -1;
            const endIndexesOfLast = this.getIndexesOf("</a>", stringToLimit);
            const indexOfLastAboveLimit = endIndexesOfLast.findIndex((index) => index >= limit);
            if(indexOfLastAboveLimit !== undefinedIndex) {
                const shiftToCloseTag = 4;
                limit = endIndexesOfLast[indexOfLastAboveLimit] + shiftToCloseTag;
            }
            return stringToLimit.substring(0, limit+1) + "...";
        } else {
            return stringToLimit;
        }
    },

    /**
     * This function indicate if the screen are in mobile device size.
     * @returns {boolean} True if the screen is smaller or equal to 960 pixels and false in otherwise.
     */
    isMobileScreen: function isMobileScreen(mobileScreenSize) {
        if (mobileScreenSize) {
            return screen.width <= mobileScreenSize;
        }

        return screen.width <= 960;
    },
};