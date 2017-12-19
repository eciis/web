# -*- coding: utf-8 -*-
"""Institution Handler."""

import json
import permissions

from google.appengine.ext import ndb

from utils import Utils
from models.invite import Invite
from utils import login_required
from utils import json_response
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from models.institution import Institution
from util.json_patch import JsonPatch
from service_entities import enqueue_task


from handlers.base_handler import BaseHandler


def getSentInvitations(institution_key):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.institution_key == institution_key,
                                Invite.status == 'sent')

    invites = [invite.make() for invite in queryInvites]

    return invites


def isUserInvited(method):
    """Check if the user is invitee to update the stub of institution."""
    def check_authorization(self, user, institution_key, inviteKey):
        invite = ndb.Key(urlsafe=inviteKey).get()

        emailIsNotInvited = invite.invitee not in user.email
        institutionIsNotInvited = ndb.Key(
            urlsafe=institution_key) != invite.stub_institution_key

        Utils._assert(emailIsNotInvited or institutionIsNotInvited,
                      'User is not invitee to create this Institution',
                      NotAuthorizedException)

        method(self, user, institution_key, inviteKey)
    return check_authorization


def childrenToJson(obj):
    """Return the array with json from institution that are obj children."""
    json = [Institution.make(institution.get(), ['name', 'key', 'state', 'invite', 'parent_institution'])
            for institution in obj.children_institutions]
    return json


def parentToJson(obj):
    """Return json with parent institution."""
    if(obj.parent_institution):
        return Institution.make(obj.parent_institution.get(), ['name', 'key', 'state', 'invite'])


def adminToJson(admin):
    """Return json with admin of institution."""
    admin_json = {
        'name': admin.name,
        'key': admin.key
    }
    return Utils.toJson(admin_json)


class InstitutionHandler(BaseHandler):
    """Institution Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        obj_key = ndb.Key(urlsafe=url_string)
        obj = obj_key.get()
        Utils._assert(obj.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        assert type(obj) is Institution, "Key is not an Institution"
        institution_json = Utils.toJson(obj, host=self.request.host)
        if(obj.admin):
            institution_json['admin'] = adminToJson(obj.admin.get())
        if(obj.invite):
            institution_json['invite'] = Institution.make(obj, ["invite"])
        institution_json['sent_invitations'] = getSentInvitations(obj.key)
        institution_json['parent_institution'] = parentToJson(obj)
        institution_json['children_institutions'] = childrenToJson(obj)

        self.response.write(json.dumps(
            institution_json
        ))

    @json_response
    @login_required
    def patch(self, user, institution_key):
        """Handler PATCH Request to update Institution."""
        user.check_permission('update_inst',
                              "User is not allowed to edit institution",
                              institution_key)

        data = self.request.body
        institution = ndb.Key(urlsafe=institution_key).get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        JsonPatch.load(data, institution)
        institution.put()
        institution_json = Utils.toJson(institution)

        self.response.write(json.dumps(
            institution_json))

    @json_response
    @login_required
    @isUserInvited
    def post(self, user, institution_key, inviteKey):
        """Handler POST Requests."""
        data = json.loads(self.request.body)

        institution = ndb.Key(urlsafe=institution_key).get()

        institution.createInstitutionWithStub(user, inviteKey, institution)

        user.name = data.get('sender_name')
        data_profile = {
            'office': 'Administrador',
            'institution_key': institution.key.urlsafe(),
            'institution_name': institution.name,
            'institution_photo_url': institution.photo_url
        }
        user.create_and_add_profile(data_profile)

        user.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        user.put()

        invite = ndb.Key(urlsafe=inviteKey).get()
        invite.send_response_notification(user, invite.admin_key.urlsafe(), 'ACCEPT')

        institution_json = Utils.toJson(institution)
        self.response.write(json.dumps(
            institution_json))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def delete(self, user, institution_key):
        """Handle DELETE Requests."""
        remove_hierarchy = self.request.get('removeHierarchy')
        institution = ndb.Key(urlsafe=institution_key).get()

        user.check_permission(
            'remove_inst',
            'User is not allowed to remove institution',
            institution_key)

        Utils._assert(not type(institution) is Institution,
                      "Key is not an institution", EntityException)

        institution.remove_institution(remove_hierarchy, user)

        params = {
            'institution_key': institution_key,
            'remove_hierarchy': remove_hierarchy
        }

        enqueue_task('remove-inst', params)

        email_params = {
            "justification": self.request.get('justification'),
            "message": """Lamentamos informar que a instituição %s foi removida
            pelo administrador %s """ % (institution.name, user.name),
            "subject": "Remoção de instituição",
            "institution_key": institution_key
        }

        enqueue_task('email-members', email_params)

        notification_params = {
            "sender_key": user.key.urlsafe(),
            "entity_type": "DELETED_INSTITUTION",
            "institution_key": institution_key
        }
        enqueue_task('notify-followers', notification_params)
