'use strict';

(function() {
    const app = angular.module("app");

    const USER_URI = '/api/user';

    app.service("ProfileService", function ProfileService($mdDialog, HttpService, AuthService, MessageService, UserService) {
        const service = this;

        const HAS_ONLY_ONE_INSTITUTION_MSG = "Esta é a única instituição ao qual você é vinculado." +
            " Ao remover o vínculo você não poderá mais acessar o sistema," +
            " exceto por meio de novo convite. Deseja remover?";

        const HAS_MORE_THAN_ONE_INSTITUTION_MSG = "Ao remover o vínculo com esta instituição," +
            " você deixará de ser membro" +
            " e não poderá mais publicar na mesma," +
            " no entanto seus posts existentes serão mantidos. Deseja remover?";

        const user = AuthService.getCurrentUser();

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

        service.editProfile = function editProfile(data) {
            data = JSON.parse(angular.toJson(data));
            return HttpService.patch(USER_URI, data);
        };

        service.removeProfile = (event, institution) => {
            if (!user.isAdmin(institution.key)) {
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
                const promise = $mdDialog.show(confirm);
                promise.then(function () {
                    service._deleteInstitution(institution.key);
                }, function () {
                    MessageService.showToast('Cancelado');
                });
                return promise;
            } else {
                MessageService.showToast('Desvínculo não permitido. Você é administrador dessa instituição.');
            }
        };

        service._deleteInstitution = (institutionKey) => {
            return new Promise(resolve => {
                UserService.deleteInstitution(institutionKey)
                    .then(_ => {
                        service._removeConection(institutionKey);
                        resolve();
                    });
            });
        };

        service._removeConection = (institutionKey) => {
            if (_.size(user.institutions) > 1) {
                user.removeInstitution(institutionKey);
                user.removeProfile(institutionKey);
                AuthService.save();
            } else {
                AuthService.logout();
            }
        }

        service._hasMoreThanOneInstitution = () => {
            return user.institutions.length > 1;
        };

    });
})();