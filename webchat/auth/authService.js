(function() {
    'use strict';

    const app = angular.module("webchat");

    app.service("AuthService", function AuthService($q, $state, $window, UserService, MessageService) {
        const service = this;

        const authObj = firebase.auth();
        let userInfo;
        let tokenLoaded = false;
        let resolveTokenPromise;
        let loadTokenPromise;
        let refreshInterval;
        const provider = new firebase.auth.GoogleAuthProvider();

        /**
         * Function to get token of logged user.
         * If the first token has not yet been loaded, it returns a promise
         * that will be resolved as soon as the token is loaded.
         * If the token has already been loaded, it returns the token.
         */
        service.getUserToken = async () => {
            if (!tokenLoaded && !loadTokenPromise) {
                loadTokenPromise = new Promise((resolve) => {
                    resolveTokenPromise = resolve;
                });
            } else if (tokenLoaded) {
                return userInfo.accessToken;
            }

            return loadTokenPromise;
        };

        /**
         * Function to get token id of user and update object userInfo
         * @param {firebaseUser} user
         */
        function getIdToken(user) {
            user.getIdToken(true).then(function(userToken) {
                if (userInfo) {
                    userInfo.accessToken = userToken;
                    service.save();
                }

                if (resolveTokenPromise) {
                    resolveTokenPromise(userToken);
                    resolveTokenPromise = null;
                }

                tokenLoaded = true;
            })
        }

        authObj.onAuthStateChanged(function(user) {
            const timeToRefresh = 3500000;
            if (user) {
                getIdToken(user);
                refreshInterval = setInterval(() => {
                    getIdToken(user);
                }, timeToRefresh);
            }
          });

        /**
        * Store listeners to be executed when user logout is called.
        */
        let onLogoutListeners = [];

        let versionAvailable = false;

        Object.defineProperty(service, 'user', {
            get: function() {
                return userInfo;
            }
        });

        // It receives the app version and verify if it matches with
        // the actual frontend version, setting up the private variable
        // versionAvailable with true, if matches, or false, otherwise.
        service.setAppVersion = function setAppVersion(appVersion) {
            if (appVersion) {
                if (appVersion === Config.APP_VERSION) {
                    versionAvailable = false;
                } else {
                    versionAvailable = true;
                }
            }
        };

        service.newVersionAvailable = function newVersionAvailable() {
            return versionAvailable;
        };

        service.setupUser = function setupUser(idToken, emailVerified) {
            const deferred = $q.defer();
            const firebaseUser = {
                accessToken : idToken,
                emailVerified: emailVerified
            };

            userInfo = firebaseUser;

            UserService.load().then(function success(userLoaded) {
                configUser(userLoaded, firebaseUser);
                deferred.resolve(userInfo);
            }, function error(error) {
                MessageService.showToast(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        function login(loginMethodPromisse) {
            return authObj.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
                return loginMethodPromisse.then(function(response) {
                    return response.user;
                });
            }).then(function(user) {
                if (user.emailVerified) {
                    return user.getIdToken(true).then(function(idToken) {
                        return service.setupUser(idToken, user.emailVerified).then(function success(userInfo) {
                                return userInfo;
                        });
                    });
                } else {
                    service.sendEmailVerification(user);
                    throw "Error! Email not verified.";
                }
            });
        }

        service.loginWithGoogle = function loginWithGoogle() {
            return login(authObj.signInWithPopup(provider));
        };

        service.loginWithEmailAndPassword = function loginWithEmailAndPassword(email, password) {
            return login(authObj.signInWithEmailAndPassword(email, password));
        };

        service.signupWithEmailAndPassword = function signupWithEmailAndPassword(email, password) {
            const deferred = $q.defer();
            authObj.createUserWithEmailAndPassword(email, password).then(function(response) {
                let user = response.user;
                var idToken = user.toJSON().stsTokenManager.accessToken;
                service.setupUser(idToken, user.emailVerified).then(function success(userInfo) {
                    service.sendEmailVerification();
                    deferred.resolve(userInfo);
                });
            }).catch(function(error) {
                MessageService.showToast(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        service.logout = function logout() {
            authObj.signOut();
            delete $window.localStorage.userInfo;
            userInfo = undefined;
            clearInterval(refreshInterval);

            executeLogoutListeners();

            $state.go("signin");
        };

        service.getCurrentUser = function getCurrentUser() {
            return userInfo;
        };

        service.isLoggedIn = function isLoggedIn() {
            if (userInfo) {
                return true;
            }
            return false;
        };

        service.save = function() {
            $window.localStorage.userInfo = JSON.stringify(userInfo);
        };

        service.reload = function reload() {
            const deferred = $q.defer();
            UserService.load().then(function success(userLoaded) {
                service.updateUser(userLoaded);
                service.save();
                deferred.resolve(userInfo);
            }, function error(error) {
                MessageService.showToast(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        service.updateUser = function updateUser(data){
            return Object.assign(userInfo, data);
        };

        service.sendEmailVerification = function sendEmailVerification(user) {
            const auth_user = user || authObj.currentUser;
            auth_user.sendEmailVerification().then(
            function success() {
                $state.go("email_verification");
            }, function error(error) {
                console.error(error);
            });
        };

        service.resetPassword = function resetPassword(email) {
            return authObj.sendPasswordResetEmail(email);

        };

        service.$onLogout = function $onLogout(callback) {
            onLogoutListeners.push(callback);
        };

        service.emailVerified = function emailVerified() {
            if (userInfo) return userInfo.emailVerified;
            return false;
        };

        /**
        * Execute each function stored to be thriggered when user logout
        * is called.
        */
        function executeLogoutListeners() {
            _.each(onLogoutListeners, function(callback) {
                callback();
            });
        }

        function configUser(userLoaded, firebaseUser) {
            userInfo = new User(userLoaded);
            _.extend(userInfo, firebaseUser);
            $window.localStorage.userInfo = JSON.stringify(userInfo);
        }

        function init() {
            if ($window.localStorage.userInfo) {
                const parse = JSON.parse($window.localStorage.userInfo);
                userInfo = new User(parse);
            }
        }

        init();
    });
})();
