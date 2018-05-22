"""Entity Exception."""

__all__ = ['EntityException']

class EntityException(Exception):
    """Entity Exception."""

    def __init__(self, msg=None):
        """Init method."""
        super(EntityException, self).__init__(
            msg or 'The user can not do this procedure in this entity.')
