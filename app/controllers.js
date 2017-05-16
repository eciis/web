(function() {
  var app = angular.module('app');

  app.controller("MainController", function MainController($mdSidenav, $state, AuthService) {
    var mainCtrl = this;

    Object.defineProperty(mainCtrl, 'user', {
      get: function() {
        return AuthService.user;
      }
    });

    mainCtrl.toggle = function toggle() {
      $mdSidenav('leftNav').toggle();
    };

    mainCtrl.settings = [
      { name: 'Início', stateTo: 'app.home', icon: 'home', enabled: true },
      { name: 'Nova Instituição', stateTo: 'app.institution', icon: 'account_balance', enabled: true },
      { name: 'Novo Usuário', stateTo: 'user.new', icon: 'person_add', enabled: true },
    ];
    
    mainCtrl.goTo = function goTo(state) {
      $state.go(state);
      mainCtrl.toggle();
    };
  });

  app.controller("HomeController", function HomeController(InstitutionService, $mdDialog) {
    var homeCtrl = this;

    homeCtrl.institutions = [];
    
    InstitutionService.get(function(info) {
      homeCtrl.institutions = info.data;
    });

    homeCtrl.delete = function deleteInst(inst, index) {
     InstitutionService.delete(inst.iid, function(info) {
      homeCtrl.institutions.splice(index, 1);
     });
    };

    homeCtrl.showAdvanced = function(ev, inst) {
      $mdDialog.show({
        controller: DialogController,
        controllerAs: 'dialogController',
        templateUrl: 'dialog1.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        bindToController: true,
        locals: { institution: inst }
      })
      .then(function(answer) {
        homeCtrl.status = 'You said the information was "' + answer + '".';
      }, function() {
        homeCtrl.status = 'You cancelled the dialog.';
      });
    };

    function DialogController($mdDialog) {
      var dialogController = this;
      dialogController.hide = function() {
        $mdDialog.hide();
      };

      dialogController.cancel = function() {
        $mdDialog.cancel();
      };

      dialogController.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    };

  });

  app.controller("NewInstitutionController", function NewInstitutionController() {
    var newInstCtrl = this;
  });

  app.controller("LoginController", function LoginController(AuthService) {
    var loginCtrl = this;

    loginCtrl.limpar = function limpar() {
      loginCtrl.user = {};
    };

    loginCtrl.login = function login() {
      console.log(url)
    };
  });
})();