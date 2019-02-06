"use strict";

var Utils = {

    /**
     * Adds the HTTP protocol name at the begin of all specified urls inside the text
     * @param {string} text that contains urls
     * @param {[string]} urls that occur inside the text
     * @returns {string} text with the altered urls
     */
    addHttpsToUrl : function addHttpsToUrl(text, urls) {
        if(urls) {
            var http = "http://";
            for (var i = 0; i < urls.length; i++) {
                if(urls[i].slice(0, 4) !== "http") {
                    text = text.replace(urls[i], http + urls[i]);
                }
             }
        }
        return text;
    },

    /**
     * Extract an object key from the specified url
     * @param {string} url that contains the key
     * @returns the key if it exists, or the url, otherwise
     */
    getKeyFromUrl : function getKeyFromUrl(url) {
        var key = url;
        if(url.indexOf("/api/key/") != -1) {
            var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
        return key;
    },

    /**
     * Recognize all urls inside a text and makes them accessible
     * @param {string} text that may contain urls
     * @returns {string} text with accessible urls
     */
    recognizeUrl : function recognizeUrl(text) {
        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";
        var urlsInText = text.match(URL_PATTERN);

        text = Utils.addHttpsToUrl(text, urlsInText);
        text = text.replace(URL_PATTERN, REPLACE_URL);
        return text;
    },

    /**
     * Replaces the original backend domain by the local one
     * @param {object} config configutarion object
     */
    updateBackendUrl : function updateBackendUrl(config) {
        var restApiUrl = Config.BACKEND_URL;

        var restApiRegex = new RegExp('^.*?/api/(.*)$');

        config.url = config.url.replace(restApiRegex, restApiUrl + '/api/$1');
    },

    /**
     * Identify all the indexes where a substring occurs inside another string
     * @param {string} substring to be searched
     * @param {string} fullString that contains the searched substring
     * @returns {[number]} a list of indexes where the substring occurs
     */
    getIndexesOf : function getIndexesOf(substring, fullString) {
        var indexes = [];
        if (substring.length !== 0) {
            var startIndex = 0, index;
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
            var undefinedIndex = -1;
            var endIndexesOfLast = this.getIndexesOf("</a>", stringToLimit);
            var indexOfLastAboveLimit = endIndexesOfLast.findIndex((index) => index >= limit);
            if(indexOfLastAboveLimit !== undefinedIndex) {
                var shiftToCloseTag = 4;
                limit = endIndexesOfLast[indexOfLastAboveLimit] + shiftToCloseTag;
            }
            return stringToLimit.substring(0, limit+1) + "...";
        } else {
            return stringToLimit;
        }
    },

    /**
     * Create a new url based on the current location host and the path received as parameter
     * @param {string} path the portion of the url to be appended to the current host
     * @returns {string} the url generated with the current host and the specified path
     */
    generateLink : function generateLink(path){
        return window.location.host + path;
    },
    
    /**
     * Set a function to be called when the content scroll ratio is equal or over 0.75
     * @param {htmlElement} content a scrollable element
     * @param {function} callback a function to be called
     */
    setScrollListener: function setScrollListener(content, callback) {
        var alreadyRequested = false;
        if(!content) return;

        content.onscroll = function onscroll() {
            var screenPosition = content.scrollTop + content.offsetHeight;
            var maxHeight = content.scrollHeight;
            var proportion = screenPosition/maxHeight;
            var scrollRatio = 0.75;
        
            if (proportion >= scrollRatio && !alreadyRequested) {
                alreadyRequested = true;

                callback().then(function success() {
                    alreadyRequested = false;
                }, function error() {
                    alreadyRequested = false;
                });
            }
        };
    },

    /**
     * Verify if email is valid.
     * @param {string} email the email that will be verified.
     * @returns {boolean} true if the email is valid or false otherwise.
     */
    validateEmail: function validateEmail(email) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    },

    /**
     * This function return an string in normalized form, without accents and special chars.
     * @param {string} string the string that will be normalized.
     * @returns {string} The string in normalized form.
     */
    normalizeString: function normalizeString(string) {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    },

    /**
     * This function return a boolean to indicate if a string has a word
     * bigger that screen width proportion.
     * @param {string} string that will be analized.
     * @param {number} screen width (optional).
     * @returns {boolean} True if string has a word bigger to the screen width proportion. False in otherwise.
     */
    isLargerThanTheScreen: function isLargerThanTheScreen(string, screenWidth) {
        var words = string.split(" ");
        var greatestWordLength = words
            .reduce((acumulator, word) => {
                return acumulator > word.length ? acumulator : word.length;
            }, 0);

        /* The values references to the width of screen */
        var smallScreen = 380;
        var mediumScreen = 640;
        var largeScreen = 840;
        var extraLargeScreen = 940;

        /* Max length of a word supported by screen width */
        var maxLengthWordToSmallScreen = 20;
        var maxLengthToMediumScreen = 41;
        var maxLengthToLargeScreen = 57;
        var maxLengthWordToExtraLargeScreen = 63;
        var maxLengthWordToGtExtraLargeScreen = 59;

        var screenWidth = screenWidth || screen.width;

        var supportSmallScreen = screenWidth <= smallScreen && greatestWordLength >= maxLengthWordToSmallScreen;
        var supportMediumScreen = screenWidth > smallScreen && screenWidth <= mediumScreen && greatestWordLength >= maxLengthToMediumScreen;
        var supportLargeScreen = screenWidth > mediumScreen && screenWidth <= largeScreen && greatestWordLength >= maxLengthToLargeScreen;
        var supportExtraLargeScreen = screenWidth > largeScreen && screenWidth <= extraLargeScreen && greatestWordLength >= maxLengthWordToExtraLargeScreen;
        var supportGtExtraLargeScreen = screenWidth > extraLargeScreen && greatestWordLength >= maxLengthWordToGtExtraLargeScreen

        return supportSmallScreen || supportMediumScreen || supportLargeScreen || supportExtraLargeScreen || supportExtraLargeScreen || supportGtExtraLargeScreen;
    },

    /**
     * This function indicate if the current screen size are smaller than the screen passed by parameter.
     * @param {number} the screen size that will be compared.
     * @returns {boolean} True if the screen is smaller or equal to the parameter and false in otherwise.
     */
    isMobileScreen: function isMobileScreen(mobileScreenSize) {
        if (mobileScreenSize) {
          return screen.width <= mobileScreenSize;
        }
        return screen.width <= 960;
    },

    /**
     * Clear array
     * @param {array} the array that will be clean.
     */
    clearArray: function clearArray(array) {
        while(array.length > 0){
            array.pop();
        }
    },

    /**
     * It selects the correct Field based on the screen size.
     * @param {String} notMobileField : The template applied to
     * screens greater than 960px;
     * @param {String} mobileField : The template applied to mobile screens.
     */
    selectFieldBasedOnScreenSize: function selectFieldBasedOnScreenSize(notMobileField, mobileField, mobileScreenSize) {
        return Utils.isMobileScreen(mobileScreenSize) ? mobileField : notMobileField;
    },

     /** Reset properties CSS of elements toolbar. 
     * In mode mobile maybe changes some properties.
     */
    resetToolbarDisplayStyle: function resetToolbarDisplayStyle(){
        const toolbar = document.getElementById('main-toolbar')
        if(toolbar)
            toolbar.style.display = 'block';
        
        const navbar = document.getElementById('navbar-bottom')
        if(navbar)
            navbar.style.display = 'flex';
    },
    
    /**
    * Get the initial letter of the user name
    * @param {Object} user : user object
    */
    getInitialLetterOfName: function getInitialLetterOfName(user) {
        if(user) return Utils.normalizeString(user.name).toUpperCase().charAt(0);
    },

    /**
     * Group users into Array of Arrays, wich the initial letter of username is the index of array
     * Index 0 to letter 'A', 1 to letter 'B'...
     * @param {Array} users : Array of users
     * @returns {Array} The array of arrays grouped by alphabet letters
     */
    groupUsersByInitialLetter: function groupUsersByInitialLetter(users) {
        const ASCIIAlphabetNumber = 65;
        let filteredUsers = [];
        users.forEach(user => {
            const initialLetterIndex = Utils.getInitialLetterOfName(user).charCodeAt(0) - ASCIIAlphabetNumber;
            if(filteredUsers[initialLetterIndex]) {
                filteredUsers[initialLetterIndex].push(user);
            } else {
                filteredUsers[initialLetterIndex] = [user];
            }
        });
        return filteredUsers;
    },

    /**
     * Returns the input property if it is defined, 
     * otherwise a default value is returned
     */
    showProperty: property => property || 'Não informado'
};
