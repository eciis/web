(function() {
    var app = angular.module("app");

    app.service("AuthService", function AuthService($http, GravatarService) {
        var service = this;

        var LOGIN_URI = "/login";

        var LOGOUT_URI = "/logout";

        var _user;

        Object.defineProperty(service, 'user', {
            get: function get() {
                return _user;
            },
            set: function set(newValue) {
                _user = newValue;
            }
        });

        service.login = function login() {
            window.location.replace(LOGIN_URI);
        };

        service.logout = function logout() {
            window.location.replace(LOGOUT_URI);
        };

        function gravatarUrl(email) {
            var hash = CryptoJS.MD5(email).toString();
            return 'https://www.gravatar.com/avatar/' + hash;
        }

        service.load = function load() {
            $http.get('/api').then(function loadUser(info) {
                service.user = info.data;
                service.user.image = gravatarUrl(info.data.email);

                GravatarService.load(service.user.email).then(function loadProfile(info) {
                    service.user.profile = info.data.entry[0];
                }, function error(error) {
                    service.user.profile = {
                        displayName: service.user.nickname,
                        preferredUsername: service.user.email
                    }
                });
            });
        };

        service.load();
    });
})();