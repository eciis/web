"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService(MessageService, $http, $q) {
        var service = this;
        var REQUESTS_URI = "/api/institutions/";

        service.sendRequest = function sendRequest(request, institution_key) {
            var deferred = $q.defer();

            $http.post(REQUESTS_URI + institution_key + "/requests/user", request).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.sendRequestInst = function sendRequestInst(request) {
            request.type_of_invite = "REQUEST_INSTITUTION";
            var deferred = $q.defer();

            $http.post(REQUESTS_URI + "requests/institution", request).then(function success(response) {
                deferred.resolve(response);
            }, function erro(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.sendRequestToParentInst = function(invite, institution_requested_key) {
            var deferred = $q.defer();
            $http.post(REQUESTS_URI + institution_requested_key + "/requests/institution_parent", invite)
                .then(function success(response) {
                    deferred.resolve(response);
            }, function error(response) {
                    deferred.reject(response);
            });
            return deferred.promise;
        };

        service.sendRequestToChildrenInst = function(invite, institution_requested_key) {
            var deferred = $q.defer();
            $http.post(REQUESTS_URI + institution_requested_key + "/requests/institution_children", invite)
                .then(function success(response) {
                    deferred.resolve(response);
            }, function error(response) {
                    deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getParentRequests = function(institution_key) {
            var deferred = $q.defer();
            $http.get(REQUESTS_URI + institution_key + "/requests/institution_parent").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getChildrenRequests = function(institution_key) {
            var deferred = $q.defer();
            $http.get(REQUESTS_URI + institution_key + "/requests/institution_children").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getRequests = function getRequests(institution_key) {
            var deferred = $q.defer();

            $http.get(REQUESTS_URI + institution_key + "/requests/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.getRequestInst = function getRequestInst(request_key) {
            var deferred = $q.defer();
            $http.get("/api/requests/" + request_key + "/institution").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.getRequest = function getRequest(request_key) {
            var deferred = $q.defer();

            $http.get("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.acceptRequest = function acceptRequest(request_key) {
            var deferred = $q.defer();

            $http.put("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.rejectRequest = function rejectRequest(request_key) {
            var deferred = $q.defer();

            $http.delete("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.acceptRequestInst = function acceptRequestInst(request_key) {
            var deferred = $q.defer();
            $http.put("/api/requests/" + request_key + "/institution").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.rejectRequestInst = function rejectRequest(request_key) {
            var deferred = $q.defer();
            $http.delete("/api/requests/" + request_key + "/institution").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.acceptInstParentRequest = function acceptRequest(request_key) {
            var deferred = $q.defer();
            $http.put("/api/requests/" + request_key + "/institution_parent").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.rejectInstParentRequest = function rejectRequest(request_key) {
            var deferred = $q.defer();
            $http.delete("/api/requests/" + request_key + "/institution_parent").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.acceptInstChildrenRequest = function acceptRequest(request_key) {
            var deferred = $q.defer();
            $http.put("/api/requests/" + request_key + "/institution_children").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.rejectInstChildrenRequest = function rejectRequest(request_key) {
            var deferred = $q.defer();
            $http.delete("/api/requests/" + request_key + "/institution_children").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred. promise;
        };

        service.showRejectDialog = function showRejectDialog(event) {
            var title = 'Rejeitar pedido';
            var textContent = "Ao rejeitar o pedido, o pedido será removido e não poderá ser aceito posteriormente." +
                        " Deseja rejeitar?";
            var promise = MessageService.showConfirmationDialog(event, title, textContent);
            return promise;
        };
    });
})();