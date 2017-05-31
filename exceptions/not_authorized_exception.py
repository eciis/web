# -*- coding: utf-8 -*-
"""Not Euthorized Exception."""


class NotAuthorizedException(Exception):
    """Not Authorized Exception."""

    def __init__(self, message=None):
        """Init method."""
        super(NotAuthorizedException, self).__init__(
            message or 'The user is not authorized to do this procedure.')
