var app = angular.module('app');
app.directive('validateYoutubeLinkDirective', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, mCtrl) {
      function validateLink(value) {
        var regexp =/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
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