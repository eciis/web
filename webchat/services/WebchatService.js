(function () {
    'use strict';

    angular.module("webchat").service('WebchatService',function WebchatService() {
         const WebchatService = this;

         WebchatService.getContacts = () => [
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
             {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"},
         ];

        WebchatService.getCurrentUser = () => (
            {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"}
        );
        
    });
})();