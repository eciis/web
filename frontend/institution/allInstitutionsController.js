(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService, $q) {
        var allInstitutionsCtrl = this;

        var content = document.getElementById("content");
        var moreInstitutions = true;
        var actualPage = 0;

        allInstitutionsCtrl.user = AuthService.getCurrentUser();
        allInstitutionsCtrl.isLoadingInstitutions = true;
        allInstitutionsCtrl.institutions = [];

        allInstitutionsCtrl.loadMoreInstitutions = function loadMoreInstitutions(reload) {
            var deferred = $q.defer();

            if (reload) { 
                allInstitutionsCtrl.loadMoreInstitutions
                actualPage = 0;
                moreInstitutions = true;
                allInstitutionsCtrl.institutions.splice(0, allInstitutionsCtrl.institutions.length);
                allInstitutionsCtrl.isLoadingInstitutions = true;
            }

            if (moreInstitutions) {
                loadInstitutions(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        function loadInstitutions(deferred) {
            InstitutionService.getNextInstitutions(actualPage).then(function success(response) {
                actualPage += 1;
                moreInstitutions = response.data.next;

                _.forEach(response.data.institutions, function(institution) {
                    allInstitutionsCtrl.institutions.push(institution);
                });

                allInstitutionsCtrl.isLoadingInstitutions = false;
                deferred.resolve();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                deferred.reject();
            });
        }
        
        allInstitutionsCtrl.loadMoreInstitutions();
        Utils.setScrollListener(content, allInstitutionsCtrl.loadMoreInstitutions); 
    }); 
})();