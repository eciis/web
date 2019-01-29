(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        InstitutionService, AuthService, $q, UserService, $state, $window) {
        var allInstitutionsCtrl = this;

        var content = document.getElementById("content");
        var moreInstitutions = true;
        let currentPage = 0;
    
        allInstitutionsCtrl.isLoadingInstitutions = true;
        allInstitutionsCtrl.institutions = [];
        allInstitutionsCtrl.filterKeyword = "";

        allInstitutionsCtrl.currentTab = 'all';

        const possibleTabs = ['all', 'following', 'member'];
        
        /**
         * It sets the currentTab correctly according to the nextTab value
         * if nextTab is part of the possible values assured by possibleTabs constant
         * {string} nextTab
         */
        allInstitutionsCtrl.changeTab = function changeTab(nextTab) {
            allInstitutionsCtrl.currentTab = (
              possibleTabs.includes(nextTab) ? nextTab : allInstitutionsCtrl.currentTab);
            
            currentPage = 0;
            loadInstitutions();
        };

        /**
         * It sets the institutions array. If it isn't the first
         * page the institutions's array must have the elements it
         * has already have and the new ones.
         * @param {Array} institutions 
         */
        function setInstitutions(institutions) {
            if(currentPage <= 1) {
                allInstitutionsCtrl.institutions = [...institutions];
            } else {
                allInstitutionsCtrl.institutions = [
                    ...allInstitutionsCtrl.institutions, 
                    ...institutions
                ];
            }
        }

        /**
         * If moreInstitutions is true, call loadInstitutions,
         * else, return a promise.
         */
        allInstitutionsCtrl.loadMoreInstitutions = function loadMoreInstitutions() {
            return moreInstitutions? loadInstitutions() : $q.when();
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

        /**
         * Retrieves the institutions that belongs to
         * the currentPage
         */
        function loadInstitutions() {
            return InstitutionService.getNextInstitutions(currentPage, allInstitutionsCtrl.currentTab)
            .then(function success(response) {
                currentPage += 1;
                moreInstitutions = response.next;

                allInstitutionsCtrl.isLoadingInstitutions = false;
                setInstitutions(response.institutions);
            });
        }
        
        /**
         * Start function.
         * Sets the scrollListener, retrieve the first 10
         * institutions and update the last time the user saw the
         * institutions.
         */
        allInstitutionsCtrl.$onInit = function () {
            allInstitutionsCtrl.loadMoreInstitutions();
            Utils.setScrollListener(content, allInstitutionsCtrl.loadMoreInstitutions);
            allInstitutionsCtrl.user = _.cloneDeep(AuthService.getCurrentUser());

            const patch = [
                {
                    op: "replace",
                    path: "/last_seen_institutions",
                    value: new Date().toISOString().split('.')[0]
                }
            ];
            UserService.save(patch).then(() => {
                AuthService.reload();
            });
        };
    }); 
})();