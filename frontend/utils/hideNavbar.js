'use strict';

(function () {
    const app = angular.module('app');

    app.directive('hideNavbar', ['$transitions', 'STATES','$state', 'SCREEN_SIZES', function($transitions, STATES, $state, SCREEN_SIZES) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.topTollbar = document.getElementById('main-toolbar');
                scope.bottomToolbar = document.getElementById('navbar-bottom');
                scope.INSTITUTION_STATES = [
                    STATES.INST_TIMELINE, STATES.INST_FOLLOWERS, STATES.INST_EVENTS,
                    STATES.INST_MEMBERS, STATES.INST_REGISTRATION_DATA, STATES.INST_LINKS,
                    STATES.INST_DESCRIPTION, STATES.CONFIG_PROFILE
                ];

                scope.STATES_WITHOUT_TOP_TOOLBAR = scope.INSTITUTION_STATES;

                scope.STATES_WITHOUT_BOTTOM_TOOLBAR = [
                    STATES.CREATE_EVENT
                ];

                scope.STATES_DINAMICALLY_BOTTOM = [
                    STATES.INST_TIMELINE
                ];

                scope.STATES_DINAMICALLY_TOP = [
                    STATES.HOME
                ];
                
                /** Definy initial style of toolbars according the current state.
                 */
                scope.initialToolbarDisplayState = function initialToolbarDisplayState(){
                    if(Utils.isMobileScreen(450)){
                        const shouldHideBottomToolbar = !scope.isBottomToolbarAllowed() || 
                            STATES.INST_TIMELINE === $state.current.name;
                        if (!scope.isStateAllowedTopMobile) scope.hideElement(scope.topTollbar);
                        if (shouldHideBottomToolbar) scope.hideElement(scope.bottomToolbar)
                        else{
                            if(scope.bottomToolbar)scope.bottomToolbar.style.display = 'flex';
                        }
                    }
                }

                /** Verify if current states is allowed to show top toolbar.
                 */
                scope.isTopToolbarAllowed = function isTopToolbarAllowed() {
                    return !inStateArray(scope.STATES_WITHOUT_TOP_TOOLBAR);
                }

                /** Verify if current states is allowed to show bottom toolbar.
                 */
                scope.isBottomToolbarAllowed = function isBottomToolbarAllowed() {
                    return !inStateArray(scope.STATES_WITHOUT_BOTTOM_TOOLBAR);
                }
                
                /** Set property CSS to hide element.
                 * @param(element HTMLElement) Element that should be hide.
                 */
                scope.hideElement = function hideElement(element){
                    if(element)
                        element.style.display = 'none';
                }

                /** Add listenner on element to hide bottom and/or top toolbar according scroll position on mobile. 
                 */
                scope.hideToolbarListenner = function hideToolbarListenner(){
                    const hideBoth = attrs.hideNavbar === "both";
                    const hideTop = attrs.hideNavbar === "top" || hideBoth;
                    const hideBottom = attrs.hideNavbar === "bottom" || hideBoth;

                    if(Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE)){
                        const content = element[0];
                        const limitScrol =  30;
    
                        const hideTopDynamically = hideTop && inStateArray(scope.STATES_DINAMICALLY_TOP);
                        const hideBottomDynamically = hideBottom && inStateArray(scope.STATES_DINAMICALLY_BOTTOM);
    
                        content.addEventListener('scroll', function() {
                            const screenPosition = content.scrollTop;
                            if (screenPosition <= limitScrol) {
                                if(scope.topTollbar){
                                    scope.topTollbar.style.animation='1.0s fadeNav ease';
                                    scope.topTollbar.style.animationDelay='0s';
                                    if(hideTopDynamically) scope.topTollbar.style.display = 'block';
                                }
                                if(hideBottomDynamically) scope.hideElement(scope.bottomToolbar);
                            } else {
                                if(hideTopDynamically) scope.topTollbar && scope.hideElement(scope.topTollbar);
                                if(hideBottomDynamically) scope.bottomToolbar.style.display = 'flex';
                            }
                        });
                    }
    
                }

                /** Verify array includes current state. 
                 */
                function inStateArray(array){
                    return array.includes($state.current.name)
                }

                /** Observer to state change and definy how initial state of toolbar.                  
                 */
                $transitions.onSuccess({
                    to: () => {return true;}
                }, () => {scope.initialToolbarDisplayState()});

                scope.isStateAllowedTopMobile = scope.isTopToolbarAllowed();
                scope.isStateAllowedBottom  = scope.isBottomToolbarAllowed();
                
                scope.initialToolbarDisplayState();
                scope.hideToolbarListenner();
            }
        };
    }]);
})();