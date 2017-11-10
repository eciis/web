'use strict';

(function() {
   var app = angular.module('app');

   app.controller('InstitutionFormController', function InstitutionFormController($stateParams, $http) {
        var instFormCtrl = this;
        instFormCtrl.institutionKey = $stateParams.institutionKey;

        instFormCtrl.firstStep = false;
        instFormCtrl.secondStep = true;
        instFormCtrl.thirdStep = false;

        getLegalNatures();
        getActuationAreas();

        function getLegalNatures() {
            $http.get('app/institution/legal_nature.json').then(function success(response) {
                instFormCtrl.legalNatures = response.data;
            });
        }

        function getActuationAreas() {
            $http.get('app/institution/actuation_area.json').then(function success(response) {
                instFormCtrl.actuationArea = response.data;
            });
        }


   });
})();