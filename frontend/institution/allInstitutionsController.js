(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        InstitutionService, AuthService, $q) {
        var allInstitutionsCtrl = this;

        var content = document.getElementById("content");
        var moreInstitutions = true;
        var actualPage = 0;

        allInstitutionsCtrl.user = AuthService.getCurrentUser();
        allInstitutionsCtrl.isLoadingInstitutions = true;
        allInstitutionsCtrl.allInstitutions = []
        allInstitutionsCtrl.institutions = [];
        allInstitutionsCtrl.filterKeyword = "";

        allInstitutionsCtrl.allInstTab = true;
        allInstitutionsCtrl.followingInstTab = false;
        allInstitutionsCtrl.memberInstTab = false;
        
        const FOLLOWING_TAB = 'following';
        const ALL_TAB = 'all';
        
        /**
         * It sets the flags correctly according to the nextTab value.
         * Besides, this function calls other aux functions that filter
         * the institutions to achieve the expected behavior
         * {string} nextTab
         */
        allInstitutionsCtrl.changeTab = function changeTab(nextTab) {
            if (nextTab === ALL_TAB) {
                allInstitutionsCtrl.allInstTab = true;
                allInstitutionsCtrl.followingInstTab = false;
                allInstitutionsCtrl.memberInstTab = false;
                setAllInstitutions();
            } else if (nextTab === FOLLOWING_TAB) {
                allInstitutionsCtrl.allInstTab = false;
                allInstitutionsCtrl.followingInstTab = true;
                allInstitutionsCtrl.memberInstTab = false;
                setFollowingInstitutions();
            } else {
                allInstitutionsCtrl.allInstTab = false;
                allInstitutionsCtrl.followingInstTab = false;
                allInstitutionsCtrl.memberInstTab = true;
                setMemberInstitutions();
            }
        };

        /**
         * Sets the institutions to allInstitutions.
         * It is done by cloning the allInstitutions array do avoid
         * it to keep reference.
         */
        function setAllInstitutions() {
            allInstitutionsCtrl.institutions = [...allInstitutionsCtrl.allInstitutions];
        }

        /**
         * Sets institutions as an array with the institutions that the
         * user follows.
         */
        function setFollowingInstitutions() {
            allInstitutionsCtrl.institutions = allInstitutionsCtrl.allInstitutions.filter(inst => {
                return allInstitutionsCtrl.user.follows.find(followingInst => {
                    return followingInst.key == inst.key;
                });
            });
        }

        /**
         * Sets institutions with the user's institutions(institutions that he is part of). 
         */
        function setMemberInstitutions() {
            allInstitutionsCtrl.institutions = allInstitutionsCtrl.allInstitutions.filter(inst => {
                return allInstitutionsCtrl.user.institutions.find(institution => {
                    return institution.key == inst.key;
                });
            });
        }


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
                
                response.institutions.map(inst => allInstitutionsCtrl.allInstitutions.push(inst));

                allInstitutionsCtrl.isLoadingInstitutions = false;
                allInstitutionsCtrl.institutions = [...allInstitutionsCtrl.allInstitutions];
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
        }
        
        allInstitutionsCtrl.loadMoreInstitutions();
        Utils.setScrollListener(content, allInstitutionsCtrl.loadMoreInstitutions); 
    }); 
})();