// Karma configuration
// Generated on Tue Jun 20 2017 07:03:46 GMT-0300 (-03)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-aria.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-messages.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-mocks.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular-material/1.1.4/angular-material.js',
        'https://unpkg.com/angular-ui-router/release/angular-ui-router.js',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js',
        'https://cdn.jsdelivr.net/lodash/4.17.4/lodash.js',
        'app.js',
        './*/*.js',
        './*/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
        './node_modules/*'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'kjhtml'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
