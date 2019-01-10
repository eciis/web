'use strict';

(function () {
    const app = angular.module('app');

    app.directive('hideNavbar', function(STATES, $state) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                const content = element[0];
                const topTollbar = document.getElementById('main-toolbar');
                const bottomToolbar = document.getElementById('navbar-bottom');
                const limitScrol =  30;

                const hideTop = attrs.hideNavbar === "top";
                const hideBoth = attrs.hideNavbar === "both";
                const hideBottom = attrs.hideNavbar === "bottom";

                const STATES_WITHOUT_TOP_TOOLBAR_MOBILE = [
                    STATES.INST_TIMELINE, STATES.INST_FOLLOWERS, STATES.INST_EVENTS,
                    STATES.INST_MEMBERS, STATES.INST_REGISTRATION_DATA, STATES.INST_LINKS
                ];
                const STATES_WITHOUT_BOTTOM_TOOLBAR = [
                    STATES.CREATE_EVENT
                ];
                let isAllowed = isAllowedState();

                if(Utils.isMobileScreen(450) && isAllowed){                    
                    content.addEventListener('scroll', function() {
                        const screenPosition = content.scrollTop;
                        if (screenPosition <= limitScrol) {
                            topTollbar.style.animation='1.0s fadeNav ease';
                            topTollbar.style.animationDelay='0s';
                            if((hideTop ||hideBoth) && isAllowed)topTollbar.style.display = 'block';
                            if(hideBottom || hideBoth) bottomToolbar.style.display = 'none';
                        } else {
                            if(!hideBottom && isAllowed) topTollbar.style.display = 'none';
                            if(!hideTop) bottomToolbar.style.display = 'flex';
                        }
                    });
                }

                function isAllowedState(){
                    var isNotAllowedTopMobile = STATES_WITHOUT_TOP_TOOLBAR_MOBILE.includes($state.current.name);
                    var isNotAllowedBottom  = STATES_WITHOUT_BOTTOM_TOOLBAR.includes($state.current.name);

                    if (isNotAllowedTopMobile) topTollbar.style.display = 'none';
                    if (isNotAllowedBottom) bottomToolbar.style.display = 'none';
                    
                    return !isNotAllowedBottom && !isNotAllowedTopMobile;
                }
            }
        };
    });
})();