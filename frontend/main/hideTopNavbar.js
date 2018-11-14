'use strict';

(function () {
    var app = angular.module('app');

    app.directive('hideTopNavbar', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                const content = element[0];
                const navbar = document.getElementById('main-toolbar');

                if(Utils.isPhoneScreen()){
                    content.addEventListener('scroll', function() {
                        const screenPosition = content.scrollTop;
                        const limitScrol =  30;
                        if (screenPosition <= limitScrol) {
                            navbar.style.display = 'block';
                        } else {
                            navbar.style.display = 'none';
                        }
                    });
                }
            }
        };
    });
})();