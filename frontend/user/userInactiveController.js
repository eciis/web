'use strict';

(function() {
    var app = angular.module("app");

    app.controller("UserInactiveController", function UserInactiveController(AuthService, RequestInvitationService, InstitutionService, 
                    $mdDialog, $state, $q, MessageService, $window) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();
        
        userInactiveCtrl.isFinished = false;
        userInactiveCtrl.choicedInst = false;
        userInactiveCtrl.wasSearched = false;
        userInactiveCtrl.institutions = [];
        userInactiveCtrl.requestsOfSelectedInst = [];
        userInactiveCtrl.request = null;
        userInactiveCtrl.selectedInst = {};

        userInactiveCtrl.getMessage = function () {
            const fistMsg = "Busque uma instituição que você faz parte.";
            return fistMsg;
        };

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.showRequestUser =  function showRequestUser(){
            return userInactiveCtrl.choicedInst && !userInactiveCtrl.isFinished;
        };

        userInactiveCtrl.sendRequest = function sendRequest() {
            var dataInvite = {
                institution_key : userInactiveCtrl.selectedInst.key,
                sender_key : userInactiveCtrl.user.key,
                admin_key : userInactiveCtrl.selectedInst.admin.key,
                is_request : true,
                type_of_invite : 'REQUEST_USER',
                sender_name : userInactiveCtrl.request.name || userInactiveCtrl.user.name,
                office : userInactiveCtrl.request.office,
                institutional_email : userInactiveCtrl.request.email
            };

            var request = new Invite(dataInvite);
            var promise = RequestInvitationService.sendRequest(request, userInactiveCtrl.selectedInst.key);
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


        // userInactiveCtrl.selectInstitution = function (institution){
        //     InstitutionService.getInstitution(institution.id)
        //     .then(function success(response) {
        //         userInactiveCtrl.selectedInst = response;
        //         userInactiveCtrl.request = {
        //             institution_name: institution.name
        //         };
        //         getRequests(userInactiveCtrl.selectedInst.key);
        //     });
        // };

        userInactiveCtrl.isInstSelected = function () {
            return !angular.equals(userInactiveCtrl.selectedInst, {});
        }

        userInactiveCtrl.onSelect = function (selectedInst) {
            userInactiveCtrl.selectedInst = selectedInst;
        }

        userInactiveCtrl.showMessage = function showMessage(){
            if(_.isEmpty(userInactiveCtrl.institutions)){
                return userInactiveCtrl.wasSearched;
            }
            return false;
        };

        userInactiveCtrl.createInst = function createInst() {
            $state.go("create_institution_form");
            $mdDialog.hide();
        };

        function getRequests(instKey) {
            RequestInvitationService.getRequests(instKey).then(function success(response) {
                userInactiveCtrl.requestsOfSelectedInst = response;
            });
        }

        userInactiveCtrl.goToLandingPage = function goToLandingPage() {
            userInactiveCtrl.logout();
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        function clearProperties(){
            userInactiveCtrl.request = null;
            userInactiveCtrl.selectedInst = {};
            userInactiveCtrl.wasSearched = true;
        }
    });
})();