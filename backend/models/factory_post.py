"""Factory of posts."""
from models.post import Post
from models.survey_post import SurveyPost


class PostFactory:
    """Class of create post."""

    @staticmethod
    def create(data, user_key, institution_key):
        """
        Method of create post.

        Receive the data.
        Return new instance of post according type.
        """
        type_class = data.get_type()
        if(type_class == 'SURVEY_POST'):
            obj = SurveyPost.create(data, user_key, institution_key)
        else:
            obj = Post()
            obj.create(data, user_key, institution_key)
        return obj

    def get_type(data):
        """Return type of post according attributes that data has."""
        if(data.type_survey):
            return 'SURVEY_POST'
        else:
            return 'POST'

    def get_permission(data):
        """Return permission according type of data has."""
        if(data.get_type() == 'SURVEY_POST'):
            return 'publish_survey_post'
        else:
            return 'publish_post'
