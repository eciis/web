"""Query Exception."""


class QueryException(Exception):
    """Entity Exception."""

    def __init__(self, msg=None):
        """Init method."""
        super(QueryException, self).__init__(msg or 'Invalid query')
