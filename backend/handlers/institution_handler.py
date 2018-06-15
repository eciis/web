# -*- coding: utf-8 -*-
"""Institution Handler."""

import json
import permissions

from google.appengine.ext import ndb

from utils import Utils
from models import Invite
from util import login_required
from utils import json_response
from custom_exceptions import NotAuthorizedException
from custom_exceptions import EntityException

from models import Institution
from util import JsonPatch
from service_entities import enqueue_task

from . import BaseHandler

__all__ = ['InstitutionHandler']

def getSentInvitations(institution_key):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.institution_key == institution_key)

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
    json = [Institution.make(institution.get(), ['name', 'photo_url', 'key', 'state', 'invite', 'parent_institution', 'acronym'])
            for institution in obj.children_institutions]
    return json


def parentToJson(obj):
    """Return json with parent institution."""
    if(obj.parent_institution):
        parent_institution = obj.parent_institution.get()
        institution_parent_json = Institution.make(parent_institution, [
            'name', 'key', 'state', 'invite', 'photo_url', 'acronym'])
        institution_parent_json['children_institutions'] = childrenToJson(parent_institution)
        return institution_parent_json


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
        Utils._assert(obj == "inactive",
                      "This institution is not active", NotAuthorizedException)
        assert type(obj) is Institution, "Key is not an Institution"
        institution_json = Utils.toJson(obj, host=self.request.host)
        if(obj.admin):
            institution_json['admin'] = adminToJson(obj.admin.get())
        if(obj.invite):
            institution_json['invite'] = Institution.make(obj, ["invite"])
        institution_json['sent_invitations'] = getSentInvitations(obj.key)
        institution_json['parent_institution'] = parentToJson(obj)
        institution_json['children_institutions'] = childrenToJson(obj)
        institution_json['cover_photo'] = obj.cover_photo

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

        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)

        JsonPatch.load(data, institution)
        institution.put()
        institution_json = Utils.toJson(institution)

        self.response.write(json.dumps(
            institution_json))

    @json_response
    @login_required
    @isUserInvited
    def put(self, user, institution_key, inviteKey):
        """
        Handle PUT Requests.
        
        This method end up the institution's configurations 
        from its previously created stub. Besides, it marks the invite received as accepted and 
        adds the permissions to the parent admins if the institution created has a parent institution.
        """
        body = json.loads(self.request.body)
        data = body['data']

        institution = ndb.Key(urlsafe=institution_key).get()

        invite = ndb.Key(urlsafe=inviteKey).get()

        Utils._assert(invite.status == 'accepted', 
            "This invitation has already been accepted", 
            NotAuthorizedException)

        invite.status = 'accepted'
        invite.put()

        institution.createInstitutionWithStub(user, institution)

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

        invite.send_response_notification(institution.key, user.key, 'ACCEPT')

        enqueue_task('add-admin-permissions', {'institution_key': institution_key})

        institution_json = Utils.toJson(institution)
        self.response.write(json.dumps(
            institution_json))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def delete(self, user, institution_key):
        """
        Handle DELETE institution.

        This handler is responsible for deleting an institution.
        If the 'remove_hierarchy' parameter is true, it removes the child hierarchy.
        When removing an institution, the permissions of administrator,
        in relation to this institution, are removed from
        the administrators of the parents institutions.
        """
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
            'remove_hierarchy': remove_hierarchy,
            'user_key': user.key.urlsafe(),
            'current_institution': user.current_institution.urlsafe()
        }

        enqueue_task('remove-inst', params)

        notification_entity = {
            'key': institution_key,
            'institution_name': institution.name,
            'remove_hierarchy': remove_hierarchy
        }

        notification_params = {
            "sender_key": user.key.urlsafe(),
            "entity_type": "DELETED_INSTITUTION",
            "institution_key": institution_key,
            "current_institution": user.current_institution.urlsafe(),
            "entity": json.dumps(notification_entity)
        }
        enqueue_task('notify-followers', notification_params)
