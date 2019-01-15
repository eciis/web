
(function() {
    'use strict';

    var app = angular.module('app');

    app.component("institutionHeader", {
        templateUrl: "/app/institution/institution_header.html",
        controller: function(){},
        controllerAs: "instHeaderCtrl",
        bindings: {
            title: '@',
            photo: '=',
            className: '@',
            
        }
    });
})();