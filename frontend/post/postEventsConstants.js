'use strict';

(function() {
    const app = angular.module('app');

    app.constant('POST_EVENTS', {
        DELETED_POST_EVENT_TO_UP: 'DELETED_POST_TO_UP',
        DELETED_POST_EVENT_TO_DOWN: 'DELETED_POST_TO_DOWN',
        NEW_POST_EVENT_TO_UP: 'NEW_POST_EVENT_TO_UP',
        NEW_POST_EVENT_TO_DOWN: 'NEW_POST_EVENT_TO_DOWN'
    });
})();