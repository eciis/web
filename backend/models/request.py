# -*- coding: utf-8 -*-
"""Request Model."""
from . import Invite
from custom_exceptions import FieldException

__all__ = ['Request']

class Request(Invite):
    """Model of Request."""
    
    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(Request, self).make()
        request_inst_json['sender'] = self.sender_key.get().email
        request_inst_json['status'] = self.status
        request_inst_json['institution_key'] = self.institution_key.urlsafe()
        request_inst_json['sender_key'] = self.sender_key.urlsafe()
        
        if self.institution_requested_key:
            requested_inst = self.institution_requested_key.get()
            parent_key = requested_inst.parent_institution
            requested_inst = requested_inst.make(Request.INST_PROPS_TO_MAKE)

            if(parent_key):
                parent_inst = parent_key.get()
                parent_inst = parent_inst.make(Request.INST_PROPS_TO_MAKE)
                requested_inst['parent_institution'] = parent_inst
            
            # TODO remove the use of requested_inst_name
            # author: Ruan Eloy - 07/08/18
            request_inst_json['requested_institution'] = requested_inst
            request_inst_json['requested_inst_name'] = requested_inst['name']

        return request_inst_json