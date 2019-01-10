// Karma configuration
module.exports = function (config) {
    config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'chai-as-promised', 'chai'],


    // list of files / patterns to load in the browser
    files: [
        "node_modules/jasmine-core/lib/jasmine-core/jasmine-core.js",
        '../utils/utils.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-messages/angular-messages.js',
        'node_modules/angular-material/angular-material.js',
        'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/crypto-js/crypto-js.js',
        'node_modules/lodash/lodash.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/firebase/firebase.js',
        'node_modules/angularfire/dist/angularfire.js',
        "node_modules/mockfirebase/browser/mockfirebase.js",
        "node_modules/moment/min/moment.min.js",
        "node_modules/angular-moment/angular-moment.js",
        "bower_components/ngMask/dist/ngMask.js",
        '../*.js',
        '../*/*.js',
        'specs/**/*.js',
    ],


    // list of files to exclude
    exclude: [
        "../sw.js"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


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
    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // if true, it shows console logs
    client: {
      captureConsole: false
    }
  })
}
