'use strict';

(function () {
    const app = angular.module('app');

    app.directive('hideTopNavbar', function(STATES, $state) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                const content = element[0];
                const navbar = document.getElementById('main-toolbar');

                if(Utils.isMobileScreen(450)){

                    const STATES_WITHOUT_NAVBAR = [STATES.INST_TIMELINE];
                    const isAllowedState  = STATES_WITHOUT_NAVBAR.reduce(function(acum, element){
                        if(acum) return acum;
                        return element === $state.current.name;
                    }, false);

                    if (isAllowedState){
                        navbar.style.display = 'none';
                    } else {
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
            }
        };
    });
})();