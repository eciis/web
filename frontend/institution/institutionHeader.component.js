
(function() {
    'use strict';

    var app = angular.module('app');

    app.component("institutionHeader", {
        templateUrl: "/app/institution/institution_header.html",
        controller: function(){
            const instHeaderCtrl = this;
            instHeaderCtrl.showButtonMore = function showButtonMore(){
                return instHeaderCtrl.inTimilinePage && (instHeaderCtrl.actionsButtons.isAdmin() || !instHeaderCtrl.isMember);
            }
        },
        controllerAs: "instHeaderCtrl",
        bindings: {
            title: '@',
            photo: '<',
            user: '<',
            institution: '<',
            isUserFollower: '<',
            isMember: '<',
            fileBackground: '=',
            className: '@',
            actionsButtons: '<',
            inTimilinePage: '<',
            inRegistrationDate: '<'
        }
    });
})();