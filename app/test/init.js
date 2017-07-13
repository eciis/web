'use strict';

var firebaseConfig = {
    apiKey: "AIzaSyCrrVy8FgG_jV-1h0EM4jpKbF3Vk5EjwCc",   // Your Firebase API key
    authDomain: "eciis-splab.firebaseapp.com",           // Your Firebase Auth domain ("*.firebaseapp.com")
    databaseURL: "https://eciis-splab.firebaseio.com",   // Your Firebase Database URL ("https://*.firebaseio.com")
    storageBucket: "eciis-splab.appspot.com"             // Your Cloud Storage for Firebase bucket ("*.appspot.com")
};
firebase.initializeApp(firebaseConfig);

// angular.module('app').service('AuthService', function() {
//     var service = this;
//     var splab = {
//             name: 'SPLAB',
//             key: '987654321' 
//     };

//     var certbio = {
//         name: 'CERTBIO',
//         key: '123456789'
//     };

//     var tiago = {
//         name: 'Tiago',
//         institutions: splab.key,
//         follows: certbio.key
//     };
//     service.user = new User(tiago);
//     service.isLoggedIn = function() {return true;};
//     service.getUserToken = function() {return "";};
//     service.getCurrentUser = function() {return service.user;};
// });