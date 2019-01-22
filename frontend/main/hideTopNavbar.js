'use strict';

(function () {
    const app = angular.module('app');

    app.directive('hideTopNavbar', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                const content = element[0];
                const navbar = document.getElementById('main-toolbar');

                if(Utils.isMobileScreen(450)){
                    content.addEventListener('scroll', function() {
                        const screenPosition = content.scrollTop;
                        const limitScrol =  30;
                        if (screenPosition <= limitScrol) {
                            navbar.style.animation='1.0s fadeNav ease';
                            navbar.style.animationDelay='0s';
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