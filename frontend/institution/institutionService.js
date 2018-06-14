(function() {
    "use strict";
    var app = angular.module("app");

    app.service("InstitutionService", function InstitutionService(HttpService, $q, AuthService) {
        var service = this;

        var INSTITUTIONS_URI = "/api/institutions";
        var LIMIT = 10;
        service.user = AuthService.getCurrentUser();

        service.getInstitutions = function getInstitutions() {
            return HttpService.get(INSTITUTIONS_URI);
        };

        service.getNextInstitutions = function getNextInstitutions(page) {
            return HttpService.get("/api/institutions?page=" + page + "&limit=" + LIMIT);
        };

        service.searchInstitutions = function searchInstitutions(value, state, type) {
            return HttpService.get(`/api/search/institution?value=${value}&state=${state}&type=${type}`);
        };

        service.follow = function follow(institution_key) {
            return HttpService.post(INSTITUTIONS_URI + "/" + institution_key + "/followers");
        };

        service.unfollow = function unfollow(institution_key) {
            return HttpService.delete(INSTITUTIONS_URI + "/" + institution_key + "/followers");
        };

        service.getNextPosts = function getNextPosts(institution_key, page) {
            return HttpService.get(INSTITUTIONS_URI + "/" + institution_key + "/timeline?page=" + page + "&limit=" + LIMIT);
        };

        service.getMembers = function getMembers(institution_key) {
            return HttpService.get(INSTITUTIONS_URI + "/" + institution_key + "/members");
        };

        service.removeMember = function removeMember(institutionKey, member, justification) {
            return HttpService.delete(INSTITUTIONS_URI + "/" + institutionKey + "/members?removeMember=" + member.key + "&justification=" + justification);
        }; 

        service.getFollowers = function getFollowers(institution_key) {
            return HttpService.get(INSTITUTIONS_URI + "/" + institution_key + "/followers");
        };

        service.getInstitution = function getInstitution(institution_key) {
            return HttpService.get(INSTITUTIONS_URI + "/" + institution_key);
        };

        service.save = function save(data, institutionKey, inviteKey) {
            var body = {data: data};
            return HttpService.put(INSTITUTIONS_URI + "/" + institutionKey + "/invites/" + inviteKey, body);
        };

        service.update = function update(institutionKey, patch) {
            return HttpService.patch(INSTITUTIONS_URI + "/" + institutionKey, patch);
        };

        service.removeInstitution = function removeInstitution(institutionKey, removeHierarchy, justification) {
            return HttpService.delete(
                INSTITUTIONS_URI + "/" + institutionKey + `?removeHierarchy=${removeHierarchy}&justification=${justification}`
            )
        };

        service.getLegalNatures = function getLegalNatures() {
            return HttpService.get('app/institution/legal_nature.json');
        };

        service.getActuationAreas = function getActuationAreas() {
            return HttpService.get('app/institution/actuation_area.json');
        };

        service.removeLink = function removeLink(institutionKey, institutionLink, isParent) {
            return HttpService.delete(INSTITUTIONS_URI + "/" + institutionKey + "/hierarchy/" + institutionLink + "?isParent=" + isParent);
        };
    });
})();