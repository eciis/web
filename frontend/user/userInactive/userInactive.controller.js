'use strict';

(function() {
		angular
		.module("app")
		.controller("UserInactiveController", function UserInactiveController(AuthService, $state) {
        const userInactiveCtrl = this;

        userInactiveCtrl.selectedInst = {};

				/**
				 * Get the message to be showed 
				 */
        userInactiveCtrl.getMessage = function () {
            return "Busque uma instituição que você faz parte.";
        };

				/**
				 * Logout the user
				 */
        userInactiveCtrl.logout = function () {
            AuthService.logout();
        };

				/**
				 * Check if one institution has been selected
				 */
        userInactiveCtrl.hasInstSelected = function () {
            return !angular.equals(userInactiveCtrl.selectedInst, {});
        };
				
				/**
				 * Set the selected institution 
				 */
        userInactiveCtrl.onSelect = function (selectedInst) {
            userInactiveCtrl.selectedInst = selectedInst;
        };
				
				/**
				 * Clear the selected institution
				 */
        userInactiveCtrl.onSearch = function () {
            userInactiveCtrl.selectedInst = {};
        };
				
				/**
				 * Go to the user request form
				 */
        userInactiveCtrl.advance = function () {
            $state.go("user_request", { institution: userInactiveCtrl.selectedInst });
        };
    
    });
})();