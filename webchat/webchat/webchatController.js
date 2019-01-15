(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('WebchatController', function WebchatController () {
        const webchatCtrl = this;

        webchatCtrl.user = {
            name: "Name",
            description: "Description",
            avatar: "https://www.w3schools.com/howto/img_avatar.png",
        };

    });

})();