"""Module of interpretation jsonPatch."""
import json

__all__ = ['JsonPatch', 'PatchException']

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


def get_attribute_of_object(obj, attribute_or_index):
    """Method of get attribute of object passed."""
    integer_signals = "-+"

    if attribute_or_index.lstrip(integer_signals).isdigit():
        attribute_or_index = int(attribute_or_index)

    if isinstance(obj, list) or isinstance(obj, dict):
        return obj[attribute_or_index]
    else:
        _assert(
            not hasattr(obj, attribute_or_index),
            "Attribute %s not found" % attribute_or_index
        )
        return getattr(obj, attribute_or_index)


def create_entity(properties_values, method_define_entity=None):
    """Create new entity of class specified."""
    if method_define_entity:
        search_for_dict(properties_values, method_define_entity)
        entity_class = None

        if isinstance(properties_values, dict):
            entity_class = method_define_entity(properties_values)

        if is_valid_entity_class(entity_class):
            return create_and_set_entity_properties(properties_values, entity_class)

    return properties_values


def is_valid_entity_class(entity_class):
    """Verify if is validd entity class."""
    return entity_class and entity_class.__name__ != 'dict'


def create_and_set_entity_properties(properties_values, entity_class):
    """Create and set properties of entities."""
    entity = entity_class()
    for property in properties_values:
        setattr(entity, property, properties_values[property])

    return entity


def search_for_dict(dict_or_list, method_define_entity):
    """
    Method of search dictionary in object passed.

    This method searches for dictionaries in the past object to
    transform them into objects of specific types.

    Keyword arguments:
    dict_or_list -- object of the type dictionary or list.
    method_define_entity -- method of define type of difctionary found.
    """
    elements = dict_or_list

    if isinstance(dict_or_list, list):
        elements = range(len(dict_or_list))

    for prop in elements:
        property = dict_or_list[prop]
        if isinstance(property, dict):
            dict_or_list[prop] = create_entity(property, method_define_entity)


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
    def params(self, value, method_define_entity, *args):
        """Receive params of function."""
        if isinstance(value, dict) or isinstance(value, list):
            value = create_entity(value, method_define_entity)
        return func(self, value, method_define_entity, *args)
    return params


class JsonPatch(object):
    """Class to interpret and apply JSONPatch."""

    @staticmethod
    def load(json_patch, obj, method_define_entity=None):
        """It loads jsonPatch and apply all operations contained therein.

        Keyword arguments:
        json_pacth -- Json of operations to be performed
        obj -- Object to be modified
        method_define_entity -- Optional method of return instance of object
        to be created. if it does not pass the object will be considered a dict
        """
        list_patchs = json.loads(json_patch, encoding="utf-8")

        for dict_patch in list_patchs:
            if dict_patch['op'] == 'test':
                JsonPatch.decode_patch(dict_patch, obj, method_define_entity)

        for dict_patch in list_patchs:
            if dict_patch['op'] != 'test':
                JsonPatch.decode_patch(dict_patch, obj, method_define_entity)

    @staticmethod
    def decode_patch(dict_patch, obj, method_define_entity):
        """Decode the received patch operation."""
        op = dict_patch['op']

        _assert(not hasattr(JsonPatch, op), "Operation %s invalid" % op)
        operation = getattr(JsonPatch, op)()
        operation.aply_patch(
            dict_patch['path'],
            obj,
            method_define_entity,
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

    def aply_patch(self, path, obj, method_define_entity, value=None):
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
                method_define_entity,
                obj,
                int(final_path),
            )
        else:
            self.operation_in_attribute(
                value,
                method_define_entity,
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

        attribute = get_attribute_of_object(obj, attribute_path)

        return self.go_through_path(attribute, path_list)

    def operation_in_list(self, value, method_define_entity, attribute_list, index):
        """Execute operation in list."""
        raise PatchException("Operation not implemented")

    def operation_in_attribute(self, value, method_define_entity, obj, attribute):
        """Execute Operation in attribute."""
        raise PatchException("Operation not implemented")


class Add(Operation):
    """Class of operation add."""

    @verify_entity
    def operation_in_list(self, value, method_define_entity, attribute_list, index):
        """Execute operation add in list."""
        _assert(value is None, "Value can not be None")
        list_insert(attribute_list, value, index)

    @verify_entity
    def operation_in_attribute(self, value, method_define_entity, obj, attribute):
        """Execute Operation add in attribute."""
        _assert(value is None, "Value can not be None")

        if isinstance(obj, dict):
            _assert(
                attribute in obj and obj[attribute] != None,
                "Attribute %s already exists" % attribute
            )
            obj[attribute] = value
        else:
            _assert(
                hasattr(obj, attribute) and getattr(obj, attribute) != None,
                "Attribute %s already exists" % attribute
            )
            obj.__setattr__(attribute, value)


class Remove(Operation):
    """Class of operation remove."""

    def operation_in_list(self, value, method_define_entity, attribute_list, index):
        """Execute operation remove in list."""
        attribute_list.pop(index)

    def operation_in_attribute(self, value, method_define_entity, obj, attribute):
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
    def operation_in_list(self, value, method_define_entity, attribute_list, index):
        """Execute operation replace in list."""
        _assert(value is None, "Value can not be None")
        attribute_list.pop(index)
        list_insert(attribute_list, value, index)

    @verify_entity
    def operation_in_attribute(self, value, method_define_entity, obj, attribute):
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
    def operation_in_list(self, value, method_define_entity, attribute_list, index):
        """Execute operation test in list."""
        _assert(attribute_list[index] != value, "Test fail, object %s "
                "does not correspond to what was passed %s"
                % (attribute_list[index], value))

    @verify_entity
    def operation_in_attribute(self, value, method_define_entity, obj, attribute):
        """Execute Operation test in attribute."""
        _assert(getattr(obj, attribute) != value, "Test fail, object "
                "%s does not correspond to what was passed %s"
                % (getattr(obj, attribute), value))
