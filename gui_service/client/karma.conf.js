module.exports = function (config) {
    'use strict';
    config.set({
        //browserNoActivityTimeout: 30000,
        basePath: 'src',
        frameworks: ['mocha', "chai"],
        preprocessors: {
            'modules/**/*.html': ['ng-html2js']
        },
        files: [
            '../node_modules/jquery/dist/jquery.min.js',
            '../node_modules/bootstrap/dist/js/bootstrap.min.js',
            '../node_modules/angular/angular.min.js',
            '../node_modules/angular-cookies/angular-cookies.min.js',
            '../node_modules/angular-route/angular-route.min.js',
            '../node_modules/angular-sanitize/angular-sanitize.min.js',
            '../node_modules/angular-resource/angular-resource.min.js',
            '../node_modules/angular-md5/angular-md5.min.js',
            '../node_modules/angular-bootstrap/ui-bootstrap.min.js',
            '../node_modules/angular-mocks/angular-mocks.js',
            '../node_modules/moment/min/moment.min.js',

            "./js/remoteGuiApp.js",
            "./js/common.js",
            "./classes/**/*.js",
            "./modules/**/*.js",
            "./modules/**/*.html",
            "../test/*.js"
        ],
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            //stripPrefix: 'src/'
            prependPrefix: '/src/'
        },

        // or define a custom transform function
        // - cacheId returned is used to load template
        //   module(cacheId) will return template at filepath
        /*cacheIdFromPath: function(filepath) {
            var cacheId = filepath.strip('public/', '');
            return cacheId;
        },*/

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        reporters: ['mocha'],
        browsers: ['Chrome']
    });
};

/*module.exports = function(config) {
    config.set({
        basePath: 'src',
        frameworks: ['mocha', "chai"],
        preprocessors: {
            'template.html': ['ng-html2js']
        },
        files: [
            '../bower_components/angular/angular.min.js',
            '../bower_components/angular-mocks/angular-mocks.js',
            "*.js",
            "*.html",
            "../test/test-test.js"
        ],

        ngHtml2JsPreprocessor: {
            // strip this from the file path
            //stripPrefix: 'src/'
            prependPrefix: '/src/'
        },

        autoWatch: true,
        reporters: ['mocha'],
        browsers: ['Chrome']
    });
};*/
