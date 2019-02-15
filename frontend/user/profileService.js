'use strict';

(function() {
    angular
    .module("app")
    .service("ProfileService", [
        '$mdDialog', 'HttpService', 'AuthService', 'MessageService', 'UserService',
        ProfileService
    ]);
    
    function ProfileService($mdDialog, HttpService, AuthService, MessageService, UserService) {
        const service = this;
        const USER_URI = '/api/user';

        const HAS_ONLY_ONE_INSTITUTION_MSG = "Esta é a única instituição ao qual você é vinculado." +
            " Ao remover o vínculo você não poderá mais acessar o sistema," +
            " exceto por meio de novo convite. Deseja remover?";

        const HAS_MORE_THAN_ONE_INSTITUTION_MSG = "Ao remover o vínculo com esta instituição," +
            " você deixará de ser membro" +
            " e não poderá mais publicar na mesma," +
            " no entanto seus posts existentes serão mantidos. Deseja remover?";

        const user = AuthService.getCurrentUser();

        /**
         * It opens a dialog to show the user profile
         * @param {string} userKey - key of the user which profile is going to be showed
         * @param {object} ev - event
         * @param {string} institutionKey - institution key related to the profile 
         */
        service.showProfile  = function showProfile(userKey, ev, institutionKey) {
             $mdDialog.show({
                templateUrl: Utils.selectFieldBasedOnScreenSize('app/user/profile.html',
                    'app/user/profile_mobile.html', 475),
                controller: "ProfileController",
                controllerAs: "profileCtrl",
                locals: {
                    user: userKey,
                    currentUserKey: user.key,
                    institutionKey: institutionKey
                },
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        /**
         * Sends a patch request with the edited fields from profile
         * @param {object} data - The pach data with the profile modifications
         */
        service.editProfile = function editProfile(data) {
            data = JSON.parse(angular.toJson(data));
            return HttpService.patch(USER_URI, data);
        };

        /**
         * Checks if the current user is admin of the given institution
         * @param {object} institution 
         */
        service._isAdmin = institution => user.isAdmin(institution.key);

        /**
         * If the user is not admin of the institution from which she wants to delete the profile, 
         * a dialog is openned, and she must confirm weather she wants to proceed with the deletion or not.
         * @param {object} event
         * @param {object} institution - institution related to the profile the user wants to remove
         */
        service.removeProfile = (event, institution) => {
            if (!service._isAdmin(institution)) {
                const textContent = service._hasMoreThanOneInstitution() ? HAS_MORE_THAN_ONE_INSTITUTION_MSG : HAS_ONLY_ONE_INSTITUTION_MSG;
                const confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Remover vínculo com ' + institution.name)
                    .textContent(textContent)
                    .ariaLabel('Remover instituicao')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                    
                return $mdDialog.show(confirm)
                    .then(function () {
                        service._deleteInstitution(institution.key);
                    }, function () {
                        MessageService.showToast('Cancelado');
                    });
            } else {
                MessageService.showToast('Desvínculo não permitido. Você é administrador dessa instituição.');
            }
        };
        /**
         * Sends a delete request to remomve the given institution from
         * the list of institution which she belongs to.
         * @param {string} institutionKey - key of the institution that is going to be removed
         */
        service._deleteInstitution = (institutionKey) => {
            return UserService.deleteInstitution(institutionKey)
                .then(_ => {
                    service._removeConnection(institutionKey);
                });
        };

        /**
         * Removes the profile and its related institution from
         * the curent user, than save the changes
         * @param {string} institutionKey - key of the institution related to the removed profile
         */
        service._removeConnection = (institutionKey) => {
            if (service._hasMoreThanOneInstitution()) {
                user.removeInstitution(institutionKey);
                user.removeProfile(institutionKey);
                AuthService.save();
            } else {
                AuthService.logout();
            }
        }

        /**
         * Checks if the user belongs to more than one institution
         */
        service._hasMoreThanOneInstitution = () => {
            return user.institutions.length > 1;
        };

    };
})();