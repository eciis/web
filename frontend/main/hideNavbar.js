'use strict';

(function () {
    const app = angular.module('app');

    const controller = 

    app.directive('hideNavbar', function(STATES, $state) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                const content = element[0];
                const topNavbar = document.getElementById('main-toolbar');
                const bottomNavbar = document.getElementById('navbar-bottom');
                const limitScrol =  30;

                const hideTop = attrs.hideNavbar === "top";
                const hideBoth = attrs.hideNavbar === "both";
                const hideBottom = attrs.hideNavbar === "bottom";

                const STATES_WITHOUT_TOP_NAVBAR = [STATES.INST_TIMELINE];
                let isNotAllowedState;

                if(Utils.isMobileScreen(450)){
                    if(!hideBottom){
                        isNotAllowedState  = STATES_WITHOUT_TOP_NAVBAR.reduce(function(acum, element){
                            if(acum) return acum;
                            return element === $state.current.name;
                        }, false);
    
                        if (isNotAllowedState){
                            topNavbar.style.display = 'none';
                        }
                        if(hideBoth) bottomNavbar.style.display = 'none';

                    }
                    
                    content.addEventListener('scroll', function() {
                        const screenPosition = content.scrollTop;
                        if (screenPosition <= limitScrol) {
                            topNavbar.style.animation='1.0s fadeNav ease';
                            topNavbar.style.animationDelay='0s';
                            if(!hideBottom && !isNotAllowedState)topNavbar.style.display = 'block';
                            if(!hideTop) bottomNavbar.style.display = 'none';
                        } else {
                            if(!hideBottom && !isNotAllowedState) topNavbar.style.display = 'none';
                            if(!hideTop) bottomNavbar.style.display = 'flex';
                        }
                    });
                }
            }
        };
    });
})();