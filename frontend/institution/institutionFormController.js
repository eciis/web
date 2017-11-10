'use strict';

(function() {
   var app = angular.module('app');

   app.controller('InstitutionFormController', function InstitutionFormController($stateParams) {
        var instFormCtrl = this;
        instFormCtrl.institutionKey = $stateParams.institutionKey;
   });
})();