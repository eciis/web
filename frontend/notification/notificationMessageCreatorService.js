'use strict';

(function() {
    var app = angular.module('app');

    app.service("NotificationMessageCreatorService", function() {
        var service = this;

        /** Types of notification based on 
         *  the number of institutions mentioned on it **/
        var NO_INST = 'no_institution';
        var SINGLE_INST = 'single_institution';
        var DOUBLE_INST = 'double_institutions';
   
        var MESSAGE_ASSEMBLERS = {
            'COMMENT': messageCreator('Comentou em um post de ', SINGLE_INST),
            'POST': messageCreator('Publicou um novo post de ', SINGLE_INST),
            'SURVEY_POST': messageCreator('Publicou uma nova enquete de ', SINGLE_INST),
            'SHARED_POST': messageCreator('Compartilhou um post de ', SINGLE_INST),
            'INVITE': messageCreator('Te enviou um novo convite via ', SINGLE_INST),
            'REMOVE_INSTITUTION_LINK': messageCreator('Removeu a conexão entre ', DOUBLE_INST),
            'DELETED_INSTITUTION': messageCreator('Removeu ', SINGLE_INST),
            'REQUEST_USER': messageCreator('Solicitou ser membro de ', SINGLE_INST),
            'REQUEST_INSTITUTION_PARENT': messageCreator('Solicitou um novo vínculo entre ', DOUBLE_INST),
            'REQUEST_INSTITUTION_CHILDREN': messageCreator('Solicitou um novo vínculo entre ', DOUBLE_INST),
            'REQUEST_INSTITUTION': messageCreator('Deseja criar uma nova institutição', NO_INST),
            'REPLY_COMMENT': messageCreator('Respondeu ao seu comentário no post de ', SINGLE_INST),
            'LIKE_COMMENT': messageCreator('Curtiu seu comentário no post de ', SINGLE_INST),
            'LIKE_POST': messageCreator('Curtiu um post de ', SINGLE_INST),
            'REJECT_INSTITUTION_LINK': messageCreator('Rejeitou sua solicitação de vínculo entre ', DOUBLE_INST),
            'ACCEPT_INSTITUTION_LINK': messageCreator('Aceitou sua solicitação de vínculo entre ', DOUBLE_INST),
            'REJECT_INVITE_USER': messageCreator('Rejeitou o convite para ser membro de ', SINGLE_INST),
            'ACCEPT_INVITE_USER': messageCreator('Aceitou o convite para ser membro de ', SINGLE_INST),
            'REJECT_INVITE_INSTITUTION': messageCreator('Rejeitou o seu convite para ser administrador', NO_INST),
            'ACCEPT_INVITE_INSTITUTION': messageCreator('Aceitou o seu convite para ser administrador', NO_INST),
            'DELETE_MEMBER': messageCreator('Removeu você de ', SINGLE_INST),
            'LEFT_INSTITUTION': messageCreator('O usuário removeu o vínculo de membro com ', SINGLE_INST),
            'ACCEPTED_LINK': messageCreator('Aceitou sua solicitação de vínculo com ', SINGLE_INST),
            'REJECTED_LINK': messageCreator('Rejeitou sua solicitação de vínculo com ', SINGLE_INST),
            'SHARED_EVENT': messageCreator('Compartilhou um evento de ', SINGLE_INST),
            'DELETED_POST': messageCreator('Deletou o seu post em ', SINGLE_INST),
            'USER_ADM': messageCreator('Indicou você para ser administrador da instituição ', SINGLE_INST),
            'ACCEPT_INVITE_USER_ADM': messageCreator('Aceitou seu convite para ser administrador de ', SINGLE_INST),
            'REJECT_INVITE_USER_ADM': messageCreator('Rejeitou seu convite para ser administrador de ', SINGLE_INST),
            'ACCEPT_INVITE_HIERARCHY': messageCreator('Aceitou seu convite e estabeleceu vínculo entre ', DOUBLE_INST),
            'TRANSFER_ADM_PERMISSIONS': messageCreator('Você agora possui permissões para administrar ', SINGLE_INST),
            'DELETED_USER': messageCreator('Removeu sua conta na Plataforma Virtual CIS', NO_INST),
            'ADD_ADM_PERMISSIONS': messageCreator('Suas permissões hierárquicas foram atualizadas na instituição ', SINGLE_INST),
            'USER_INVITES_SENT': messageCreator('Todos os convites para novos membros foram enviados', NO_INST)
        };


        service.assembleMessage = function assembleMessage(entity_type, mainInst, otherInst) {
            var assembler = MESSAGE_ASSEMBLERS[entity_type];
            return assembler(mainInst, otherInst);
        };

        function messageCreator(message, notificationType) {
            return function (mainInst, otherInst) {
                switch(notificationType) {
                    case DOUBLE_INST: 
                        return message + `${mainInst} e ${otherInst}`; 
                    case SINGLE_INST:
                        return message + (mainInst || otherInst); 
                    default:
                        return message;
                }
            };            
        }
    });
})();