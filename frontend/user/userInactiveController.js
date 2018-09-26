'use strict';

(function() {
    var app = angular.module("app");

    app.controller("UserInactiveController", function UserInactiveController(AuthService, RequestInvitationService, InstitutionService, 
                    $mdDialog, $state, $q, MessageService, $window) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();
        
        userInactiveCtrl.isFinished = false;
        userInactiveCtrl.choicedInst = false;
        userInactiveCtrl.search = "";
        userInactiveCtrl.hasInstSelect = false;
        userInactiveCtrl.wasSearched = false;
        userInactiveCtrl.institutions = [];
        userInactiveCtrl.requestsOfSelectedInst = [];
        userInactiveCtrl.request = null;
        userInactiveCtrl.institutionSelect = {};
        var ACTIVE = 'active';

        window.addEventListener('popstate', function(event) {
            // The popstate event is fired each time when the current history entry changes.
            userInactiveCtrl.logout();
            window.removeEventListener('popstate', ()=>{})
        
        }, false);

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.confirmInst =  function confirmInst(){
            if(userInactiveCtrl.hasInstSelect){
                userInactiveCtrl.choicedInst = true;
            } else {
                MessageService.showToast("Escolha uma instituição.");
            }
        };

        userInactiveCtrl.showRequestUser =  function showRequestUser(){
            return userInactiveCtrl.choicedInst && !userInactiveCtrl.isFinished;
        };

        userInactiveCtrl.showButtonNext =  function showButtonNext(){
            var hasInstFound = userInactiveCtrl.institutions.length > 0;
            return !userInactiveCtrl.choicedInst && hasInstFound;
        };

        userInactiveCtrl.sendRequest = function sendRequest() {
            var dataInvite = {
                institution_key : userInactiveCtrl.institutionSelect.key,
                sender_key : userInactiveCtrl.user.key,
                admin_key : userInactiveCtrl.institutionSelect.admin.key,
                is_request : true,
                type_of_invite : 'REQUEST_USER',
                sender_name : userInactiveCtrl.request.name || userInactiveCtrl.user.name,
                office : userInactiveCtrl.request.office,
                institutional_email : userInactiveCtrl.request.email
            };

            var request = new Invite(dataInvite);
            var promise = RequestInvitationService.sendRequest(request, userInactiveCtrl.institutionSelect.key);
            promise.then(function success() {
                $mdDialog.hide();
                MessageService.showToast("Pedido enviado com sucesso!");
                userInactiveCtrl.isFinished = true;
            });
        };

        userInactiveCtrl.verifyAndSendRequest = function verifyAndSendRequest() {
            if (!_.isEmpty(userInactiveCtrl.requestsOfSelectedInst)) {
                const sender_keys = userInactiveCtrl.requestsOfSelectedInst
                                    .filter(request => request.status === "sent")
                                    .map(request => request.sender_key);
                return !sender_keys.includes(userInactiveCtrl.user.key) ?
                       userInactiveCtrl.sendRequest() : 
                       MessageService.showToast("Usuário já solicitou fazer parte dessa instituição.");
            } else {
                userInactiveCtrl.sendRequest();
            }
        };

        userInactiveCtrl.selectInstitution = function selectInstitution(institution){
            var deferred = $q.defer();

            InstitutionService.getInstitution(institution.id).then(function success(response) {
                userInactiveCtrl.institutionSelect = response;
                userInactiveCtrl.hasInstSelect = true;
                userInactiveCtrl.showFullInformation(institution);
                userInactiveCtrl.request = {
                    institution_name: institution.name
                };
                getRequests(userInactiveCtrl.institutionSelect.key);
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        userInactiveCtrl.showMessage = function showMessage(){
            if(_.isEmpty(userInactiveCtrl.institutions)){
                return userInactiveCtrl.wasSearched;
            }
            return false;
        };

        userInactiveCtrl.isInstSelect = function isInstSelect(institution){
            return userInactiveCtrl.institutionSelect.key === institution.id;
        };

        userInactiveCtrl.showMenu = function showMenu() {
            var deferred = $q.defer();
            if(userInactiveCtrl.search) {
                userInactiveCtrl.finalSearch = userInactiveCtrl.search;
                userInactiveCtrl.makeSearch().then(function success() {
                    deferred.resolve(userInactiveCtrl.institutions);
                });
            }
            return deferred.promise;
        };

        userInactiveCtrl.showFullInformation = function showFullInformation(institution){
           if(!_.isEmpty(userInactiveCtrl.institutions)){
                return userInactiveCtrl.institutionSelect.key === institution.id;
            }
            return false;
        };

        userInactiveCtrl.getFullAddress = function getFullAddress(institution) {
                var instObject = new Institution(institution);
                return instObject.getFullAddress();
        };

        userInactiveCtrl.createInst = function createInst() {
            window.removeEventListener('popstate', ()=>{});
            $state.go("create_institution_form");
            $mdDialog.hide();
        };

        function getRequests(instKey) {
            RequestInvitationService.getRequests(instKey).then(function success(response) {
                userInactiveCtrl.requestsOfSelectedInst = response;
            });
        }

        userInactiveCtrl.makeSearch = function () {
            var deferred = $q.defer();
            clearProperties();
            InstitutionService.searchInstitutions(userInactiveCtrl.finalSearch, ACTIVE, 'institution').then(function success(response) {
                userInactiveCtrl.institutions = response;
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        userInactiveCtrl.goToLandingPage = function goToLandingPage() {
            userInactiveCtrl.logout();
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        function clearProperties(){
            userInactiveCtrl.request = null;
            userInactiveCtrl.institutionSelect = {};
            userInactiveCtrl.hasInstSelect = false;
            userInactiveCtrl.wasSearched = true;
        }
    });
})();