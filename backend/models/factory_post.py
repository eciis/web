"""Factory of posts."""
from . import Post
from . import SurveyPost


class PostFactory:
    """Class of create post."""

    @staticmethod
    def create(data, user_key, institution_key):
        """
        Method of create post.

        Receive the data.
        Return new instance of post according type.
        """
        type_class = PostFactory.get_type(data)
        if(type_class == 'SURVEY_POST'):
            obj = SurveyPost.create(data, user_key, institution_key)
        else:
            obj = Post()
            obj.create(data, user_key, institution_key)
        obj.put()
        return obj

    @staticmethod
    def get_type(data):
        """Return type of post according attributes that data has."""
        if(data.get("type_survey")):
            return 'SURVEY_POST'
        else:
            return 'POST'
