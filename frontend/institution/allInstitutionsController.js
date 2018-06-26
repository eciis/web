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
        allInstitutionsCtrl.filterKeyword = "";

        allInstitutionsCtrl.loadMoreInstitutions = function loadMoreInstitutions() {
            var deferred = $q.defer();

            if (moreInstitutions) {
                loadInstitutions(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        allInstitutionsCtrl.getInstitutions = function getInstitutions() {
            if(allInstitutionsCtrl.filterKeyword === "" || allInstitutionsCtrl.filterKeyword === "*") {
                return allInstitutionsCtrl.institutions;
            } else {
                return allInstitutionsCtrl.institutions
                    .filter(inst =>
                        _.includes(normalizeString(inst.name), normalizeString(allInstitutionsCtrl.filterKeyword)));
            }
        };

        function normalizeString(string) {
            return Utils.normalizeString(string);
        }

        function loadInstitutions(deferred) {
            InstitutionService.getNextInstitutions(actualPage).then(function success(response) {
                actualPage += 1;
                moreInstitutions = response.next;
                
                _.forEach(response.institutions, function(institution) {
                    allInstitutionsCtrl.institutions.push(institution);
                });

                allInstitutionsCtrl.isLoadingInstitutions = false;
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
        }
        
        allInstitutionsCtrl.loadMoreInstitutions();
        Utils.setScrollListener(content, allInstitutionsCtrl.loadMoreInstitutions); 
    }); 
})();