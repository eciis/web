'use strict';

(function () {
    const app = angular.module('app');

    app.directive('hideNavbar', ['$transitions', 'STATES','$state', function($transitions, STATES, $state) {
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
                scope.STATES_WITHOUT_BOTTOM_TOOLBAR = [
                    STATES.CREATE_EVENT
                ];
                
                /** Definy initial style of toolbars according the current state.
                 */
                scope.initialToolbarDisplayState = function initialToolbarDisplayState(){
                    const shouldHideBottomToolbar = !scope.isBottomToolbarAllowed() || 
                        STATES.INST_TIMELINE === $state.current.name;
                    if (!scope.isStateAllowedTopMobile) scope.hideElement(scope.topTollbar);
                    if (shouldHideBottomToolbar) scope.hideElement(scope.bottomToolbar)
                    else scope.bottomToolbar.style.display = 'flex';
                }

                /** Verify if current states is allowed to show top toolbar.
                 */
                scope.isTopToolbarAllowed = function isTopToolbarAllowed() {
                    let statesNotAllowed = [STATES.CREATE_EVENT];
                    statesNotAllowed = statesNotAllowed.concat(scope.INSTITUTION_STATES);
                    return !statesNotAllowed.includes($state.current.name);
                }

                /** Verify if current states is allowed to show bottom toolbar.
                 */
                scope.isBottomToolbarAllowed = function isBottomToolbarAllowed() {
                    return !scope.STATES_WITHOUT_BOTTOM_TOOLBAR.includes($state.current.name);
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

                    if(Utils.isMobileScreen(450)){
                        const content = element[0];
                        const limitScrol =  30;
    
                        const hideTopDynamically = hideTop && scope.isStateAllowedTopMobile;
                        const hideBottomDynamically = hideBottom && scope.isStateAllowedBottom;
    
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

                /** Observer to state change and definy how initial state of toolbar.                 * 
                 */
                $transitions.onSuccess({
                    to: (state) => {return true;}
                }, () => {scope.initialToolbarDisplayState()});

                scope.isStateAllowedTopMobile = scope.isTopToolbarAllowed();
                scope.isStateAllowedBottom  = scope.isBottomToolbarAllowed();
                
                scope.initialToolbarDisplayState();
                scope.hideToolbarListenner();
            }
        };
    }]);
})();