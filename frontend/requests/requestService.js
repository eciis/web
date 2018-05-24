"use strict";

(function() {
    const app = angular.module('app');

    app.service("RequestService", function RequestService($mdDialog) {
        const service = this;

        service.analyseReqDialog = function analyseReqDialog(event, child, request) {
            $mdDialog.show({
                controller: 'AnalyseHierarchyRequestController',
                controllerAs: 'analyseHierReqCtrl',
                templateUrl: 'app/requests/analyse_hierarchy_request_dialog.html',
                targetEvent: event,
                locals: {
                    child: child,
                    parent: request.institution,
                    request: request
                }
            });
        };
    });
})();