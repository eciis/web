"use strict";

(function() {
    const app = angular.module("app");

    app.constant("STATES", {
        APP: "app",
        USER: "app.user",
        SEARCH: "app.user.search",
        HOME: "app.user.home",
        USER_INSTITUTIONS: "app.user.institutions",
        EVENTS: "app.user.events",
        CREATE_EVENT: "app.user.create_event",
        INVITE_INSTITUTION: "app.user.invite_inst",
        CONFIG_PROFILE: "app.user.config_profile",
        NOTIFICATION: "app.user.notifications",
        INSTITUTION: "app.institution",
        INST_TIMELINE: "app.institution.timeline",
        INST_FOLLOWERS: "app.institution.followers",
        INST_EVENTS: "app.institution.events",
        INST_MEMBERS: "app.institution.members",
        INST_REGISTRATION_DATA: "app.institution.registration_data",
        INST_LINKS: "app.institution.institutional_links",
        POST: "app.post",
        MANAGE_INST: "app.manage_institution",
        MANAGE_INST_MEMBERS: "app.manage_institution.members",
        MANAGE_INST_EDIT: "app.manage_institution.edit_info",
        MANAGE_INST_INVITE_INST: "app.manage_institution.invite_inst",
        EVENT_DETAILS: "app.user.event",
        NEW_INVITE: "new_invite",
        SIGNIN: "signin",
        CREATE_INST: "create_institution",
        CREATE_INST_FORM: "create_institution_form",
        ACCEPT_INVITE: "accept_invite",
        EMAIL_VERIFICATION: "email_verification",
        RESET_PASSWORD: "reset_password",
        USER_INACTIVE: "user_inactive",
        USER_REQUEST: "user_request",
        ERROR: "app.error"
    });
})();