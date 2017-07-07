"""Field Exception."""

class FieldException(Exception):
    """Field Exception."""

    def __init__(self, msg=None):
        """Class constructor."""
        super(FieldException, self).__init__(msg or "Invalid field")
