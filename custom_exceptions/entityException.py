"""Entity Exception."""


class EntityException(Exception):
    """Not Authorized Exception."""

    def __init__(self, message=None):
        """Init method."""
        super(EntityException, self).__init__(
            message or 'The user can not do this procedure in this entity.')
