"""Not Authorized Exception."""

__all__ = ['NotAuthorizedException']

class NotAuthorizedException(Exception):
    """Not Authorized Exception."""

    def __init__(self, msg=None):
        """Init method."""
        super(NotAuthorizedException, self).__init__(
            msg or 'The user is not authorized to do this procedure.')
