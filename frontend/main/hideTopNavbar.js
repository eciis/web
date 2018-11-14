'use strict';

(function () {
    var app = angular.module('app');

    app.directive('hideTopNavbar', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                console.log(element);
                console.log( "ready!" );
                var content = element[0];
                var navbar = document.getElementById('main-toolbar');

                content.addEventListener('scroll', function() {
                    var screenPosition = content.scrollTop + content.offsetHeight;
                    var maxHeight = content.scrollHeight;
                    var proportion = screenPosition/maxHeight;
                    var scrollRatio =  0.33;
                    if(scrollRatio > proportion) {
                        navbar.style.display = 'inline';

                    }
                    else  navbar.style.display = 'none';
                });
            }
        };
    });
})();