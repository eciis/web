"""Module of interpretation jsonPatch."""
import json


class PatchException(Exception):
    """Exception of interpretation patch."""

    def __init__(self, msg=None):
        """Constructor of class."""
        super(PatchException, self).__init__(msg or "Invalid patch")


def _assert(condition, msg):
    """
    Verify if condition is true.

    Oterwise generetes an exception with message passed.
    """
    if condition:
        raise PatchException(msg)


def create_entity(properties_values, entity_class=None):
    """Create new entity of class specified."""
    if entity_class:
        entity = entity_class()

        for property in properties_values:
            setattr(entity, property, properties_values[property])
        return entity
    else:
        return properties_values


def list_insert(list, value, index):
    """Insert element in list."""
    top_list = -1
    if index == top_list:
        list.append(value)
    else:
        list.insert(index, value)


def verify_entity(func):
    """Decorator for verify if value passed is dict.

    If it is, create an object with the dict and pass it as a
    parameter in place of the value.
    """
    def params(self, value, entity_class, *args):
        """Receive params of function."""
        if isinstance(value, dict):
            value = create_entity(value, entity_class)
        return func(self, value, entity_class, *args)
    return params


class JsonPatch(object):
    """Class to interpret and apply JSONPatch."""

    @staticmethod
    def load(json1, obj, entity_class=None):
        """It loads jsonPatch and apply all operations contained therein."""
        list_patchs = json.loads(json1, encoding="utf-8")

        for dict_patch in list_patchs:
            if dict_patch['op'] == 'test':
                JsonPatch.decode_patch(dict_patch, obj, entity_class)

        for dict_patch in list_patchs:
            if dict_patch['op'] != 'test':
                JsonPatch.decode_patch(dict_patch, obj, entity_class)

    @staticmethod
    def decode_patch(dict_patch, obj, entity_class):
        """Decode the received patch operation."""
        op = dict_patch['op']

        _assert(not hasattr(JsonPatch, op), "Operation %s invalid" % op)
        operation = getattr(JsonPatch, op)()
        operation.aply_patch(
            dict_patch['path'],
            obj,
            entity_class,
            dict_patch.get('value')
        )

    @staticmethod
    def add():
        """Return an instance of class operation Add."""
        return Add()

    @staticmethod
    def remove():
        """Return an instance of class operation Remove."""
        return Remove()

    @staticmethod
    def replace():
        """Return an instance of class operation Replace."""
        return Replace()

    @staticmethod
    def test():
        """Return an instance of class operation Test."""
        return Test()


class Operation(object):
    """Class of operations in patch."""

    def aply_patch(self, path, obj, entity_class, value=None):
        """Apply operation to received path."""
        path_list = path[1:].split('/')
        final_path = path_list.pop(-1)
        obj = Operation.go_through_path(self, obj, path_list)
        flag_index_top = "-"
        index_top = "-1"
        integer_signals = "-+"

        if final_path == flag_index_top:
            final_path = index_top

        if final_path.lstrip(integer_signals).isdigit():
            self.operation_in_list(
                value,
                entity_class,
                obj,
                int(final_path),
            )
        else:
            self.operation_in_attribute(
                value,
                entity_class,
                obj,
                final_path,
            )

    def go_through_path(self, obj, path_list):
        """Traverse the paths and returns the last accessed object."""
        flag_index_top = "-"
        index_top = "-1"

        if len(path_list) == 0:
            return obj

        attribute_path = path_list.pop(0)

        if attribute_path == flag_index_top:
            attribute_path = index_top

        if isinstance(obj, list):
            attribute = obj[int(attribute_path)]
        else:
            _assert(
                not hasattr(obj, attribute_path),
                "Attribute %s not found" % attribute_path
            )
            attribute = getattr(obj, attribute_path)

        return Operation.go_through_path(self, attribute, path_list)

    def operation_in_list(self, value, entity_class, attribute_list, index):
        """Execute operation in list."""
        raise PatchException("Operation not implemented")

    def operation_in_attribute(self, value, entity_class, obj, attribute):
        """Execute Operation in attribute."""
        raise PatchException("Operation not implemented")


class Add(Operation):
    """Class of operation add."""

    @verify_entity
    def operation_in_list(self, value, entity_class, attribute_list, index):
        """Execute operation add in list."""
        _assert(value is None, "Value can not be None")
        list_insert(attribute_list, value, index)

    @verify_entity
    def operation_in_attribute(self, value, entity_class, obj, attribute):
        """Execute Operation add in attribute."""
        _assert(value is None, "Value can not be None")

        if isinstance(obj, dict):
            _assert(
                attribute in obj,
                "Attribute %s already exists" % attribute
            )
            obj[attribute] = value
        else:
            _assert(
                hasattr(obj, attribute),
                "Attribute %s already exists" % attribute
            )
            obj.__setattr__(attribute, value)


class Remove(Operation):
    """Class of operation remove."""

    def operation_in_list(self, value, entity_class, attribute_list, index):
        """Execute operation remove in list."""
        attribute_list.pop(index)

    def operation_in_attribute(self, value, entity_class, obj, attribute):
        """Execute Operation remove in attribute."""
        if isinstance(obj, dict):
            _assert(
                attribute not in obj,
                "Attribute %s not found" % attribute
            )
            del obj[attribute]
        else:
            _assert(
                not hasattr(obj, attribute),
                "Attribute %s not found" % attribute
            )

            obj.__delattr__(attribute)


class Replace(Operation):
    """Class of operation replace."""

    @verify_entity
    def operation_in_list(self, value, entity_class, attribute_list, index):
        """Execute operation replace in list."""
        _assert(value is None, "Value can not be None")
        attribute_list.pop(index)
        list_insert(attribute_list, value, index)

    @verify_entity
    def operation_in_attribute(self, value, entity_class, obj, attribute):
        """Execute Operation replace in attribute."""
        if isinstance(obj, dict):
            _assert(
                attribute not in obj,
                "Attribute %s not found" % attribute
            )
            obj[attribute] = value
        else:
            _assert(
                not hasattr(obj, attribute),
                "Attribute %s not found" % attribute
            )
            _assert(value is None, "Value can not be None")

            obj.__setattr__(attribute, value)


class Test(Operation):
    """Class of operation test."""

    @verify_entity
    def operation_in_list(self, value, entity_class, attribute_list, index):
        """Execute operation test in list."""
        _assert(attribute_list[index] != value, "Test fail, object %s "
                "does not correspond to what was passed %s"
                % (attribute_list[index], value))

    @verify_entity
    def operation_in_attribute(self, value, entity_class, obj, attribute):
        """Execute Operation test in attribute."""
        _assert(getattr(obj, attribute) != value, "Test fail, object "
                "%s does not correspond to what was passed %s"
                % (getattr(obj, attribute), value))
