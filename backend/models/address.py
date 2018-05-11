from google.appengine.ext import ndb

__all__ = ['Address']

class Address(ndb.Model):
    """Address model."""

    number = ndb.StringProperty()

    street = ndb.StringProperty()

    neighbourhood = ndb.StringProperty()

    city = ndb.StringProperty()

    federal_state = ndb.StringProperty()

    cep = ndb.StringProperty()

    country = ndb.StringProperty()

    def __iter__(self):
        """Make this object iterable."""
        yield 'number', self.number
        yield 'street', self.street
        yield 'neighbourhood', self.neighbourhood
        yield 'city', self.city
        yield 'federal_state', self.federal_state
        yield 'cep', self.cep
        yield 'country', self.country
    
    def make(self):
        address = {
            'city': self.city,
            'country': self.country,
            'federal_state': self.federal_state,
            'number': self.number,
            'street': self.street
        }

        return address

    @staticmethod
    def create(data):
        """Create an address model instance."""
        address = Address()
        address.number = data.get('number')
        address.street = data.get('street')
        address.neighbourhood = data.get('neighbourhood')
        address.city = data.get('city')
        address.federal_state = data.get('federal_state')
        address.cep = data.get('cep')
        address.country = data.get('country')

        return address
    