var app = angular.module('app');
app.directive('validateYoutubeLinkDirective', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, mCtrl) {

      function validateLink(value) {
        var regexp = /(?:http(s)?:\/\/)?(www\.)?youtube\.com\/watch\\?v=.+/;
        console.log(":::::::::::::::::::::::::::::::::::::::::")
        console.log(regexp.test(value));
        if (regexp.test(value)) {
          mCtrl.$setValidity('pattern', true);
        } else {
          mCtrl.$setValidity('pattern', false);
        }
        return value;
      }
      mCtrl.$parsers.push(validateLink);
    }
  };
});