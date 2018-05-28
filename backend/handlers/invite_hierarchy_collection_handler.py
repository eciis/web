"""."""

import re
import json
from . import BaseHandler
from custom_exceptions import NotAuthorizedException
from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from utils import Utils
from models import InviteFactory
from service_entities import enqueue_task

__all__ = ['InviteHierachyCollectionHandler']

class InviteHierachyCollectionHandler(BaseHandler):
    
    @login_required
    @json_response
    def post(self, user):
        body = json.loads(self.request.body)
        data = body['data']
        host = self.request.host
        invite = data['invite_body']
        type_of_invite = invite.get('type_of_invite')

        invite_pattern = re.compile('^INVITE.*(CHILDREN|PARENT)$')
        Utils._assert(
            not invite_pattern.match(type_of_invite),
            "invitation type not allowed", 
            NotAuthorizedException
        )

        institution = ndb.Key(urlsafe=invite['institution_key']).get()
        can_invite_inst = user.has_permission(
            "send_link_inst_invite", institution.key.urlsafe())

        Utils._assert(
            not can_invite_inst,
            "User is not allowed to send hierarchy invites", 
            NotAuthorizedException
        )

        invite = createInvite(invite)
        enqueue_task('send-invite', {
            'invites_keys': json.dumps([invite.key.urlsafe()]), 
            'host': host,
            'current_institution': user.current_institution.urlsafe()
        })

        self.respose.write(json.dumps({'msg': 'The invite are being processed.', 'invite' : invite}))


@ndb.transactional(xg=True)
def createInvite(data):
    """Create an invite."""
    invite = InviteFactory.create(data, data['type_of_invite'])
    invite.put()

    if(invite.stub_institution_key):
        invite.stub_institution_key.get().addInvite(invite)
    
    return invite
