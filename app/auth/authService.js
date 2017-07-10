'use strict';

(function() {
    var app = angular.module("app");

    app.service("AuthService", function AuthService($http, $q, $rootScope, $state, $firebaseAuth) {
        var service = this;

        var authObj = $firebaseAuth();

        service.login = function login() {
            authObj.$signInWithPopup("google").then(function() {
              $state.go("app.home");
            }).catch(function(error) {
              console.error("Authentication failed:", error);
            });
        };
        
        service.logout = function logout() {
            authObj.$signOut();
        };

        service.getCurrentUser = function getCurrentUser() {
            return authObj.$getAuth();
        };

        service.isLoggedIn = function isLoggedIn() {
            console.log("Logged in? ", authObj.$getAuth());
            return authObj.$getAuth() !== null;
        };

        authObj.$onAuthStateChanged(function(firebaseUser) {
          if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.displayName);
          } else {
            console.log("Signed out");
            $state.go("signin");
          }
        });
    });
})();