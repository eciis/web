(function() {
    'use strict';

     var app = angular.module('app');

     app.component("institutionHeader", {
        templateUrl: "/app/institution/institution_header.html",
        controller: ['$state', 'STATES', function($state, STATES){
            const instHeaderCtrl = this;

            /** Return if should show or hide button more,
             *  show if in timeline and is admin or member.
             */
            instHeaderCtrl.showButtonMore = function showButtonMore(){
                const institutionKey = instHeaderCtrl.institution && instHeaderCtrl.institution.key;
                const isAdmin = instHeaderCtrl.user.isAdmin(institutionKey);

                return instHeaderCtrl.isTimeline() && 
                    ( !instHeaderCtrl.isMember || isAdmin);
            };

            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isTimeline = function isTimeline(){
                return $state.current.name == STATES.INST_TIMELINE;
            };
    
            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isRegistrationData = function isRegistrationData(){
                return $state.current.name == STATES.INST_REGISTRATION_DATA;
            };

            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isDescription = function isDescription(){
                return $state.current.name == STATES.INST_DESCRIPTION;
            };

            /** Return the title of page according current state.
             */
            instHeaderCtrl.getTitle = function getTitle(){                
                const instName = instHeaderCtrl.institution ? instHeaderCtrl.institution.name : "";
                const limitedInstName = Utils.limitString(instName, 110);
                
                switch($state.current.name) {
                    case STATES.INST_TIMELINE: 
                    case STATES.MANAGE_INST_EDIT: return limitedInstName;
                    case STATES.INST_REGISTRATION_DATA: return "Dados cadastrais";
                    case STATES.INST_LINKS: return "Vínculos Institucionais";
                    case STATES.INST_MEMBERS: return "Membros";
                    case STATES.INST_FOLLOWERS: return "Seguidores";
                };
            };

            instHeaderCtrl.showButtonEdit = function showButtonEdit(){
                return (instHeaderCtrl.isRegistrationData() || instHeaderCtrl.isDescription()) &&
                    instHeaderCtrl.institution && instHeaderCtrl.user.isAdmin(instHeaderCtrl.institution.key);
            };
            
            instHeaderCtrl.editInfo = function editInfo($event){
                if(instHeaderCtrl.isDescription())instHeaderCtrl.actionsButtons.editDescription();
                if(instHeaderCtrl.isRegistrationData())instHeaderCtrl.actionsButtons.editRegistrationData($event);
            };
        }],
        controllerAs: "instHeaderCtrl",
        bindings: {
            photo: '<',
            user: '<',
            institution: '<',
            isUserFollower: '<',
            isMember: '<',
            fileBackground: '=',
            className: '@',
            actionsButtons: '<'
        }
    });
})(); 
