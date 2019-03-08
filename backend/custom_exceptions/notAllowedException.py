"""Not Allowed Exception."""

__all__ = ['NotAllowedException']

class NotAllowedException(Exception):
    """Not Allowed Exception."""

    def __init__(self, msg=None):
        """Init method."""
        super(NotAllowedException, self).__init__(msg or 'Operation not allowed.')