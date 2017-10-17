"""Survey Post Model."""
from models.post import Post
from google.appengine.ext import ndb
from utils import Utils
import datetime


class SurveyPost(Post):
    """Model of survey post."""

    options = ndb.JsonProperty()

    # Type of survey.
    type_survey = ndb.StringProperty(choices=set([
        'multiple_choice',
        'binary']))

    # Date and time limit that survey will receive answers
    deadline = ndb.DateTimeProperty(required=True)

    @staticmethod
    def create(data, author_key, institution_key):
        """Create a post and check required fields."""
        survey_post = SurveyPost()
        survey_post.options = Utils.toJson(data.get("options"))
        survey_post.deadline = datetime.datetime.strptime(
            data.get('deadline'), "%Y-%m-%dT%H:%M:%S")

        survey_post = super(SurveyPost, survey_post).create(
            data, author_key, institution_key)

        return survey_post

    def add_vote(self, author_key, option):
        """Add a vote to the survey post."""
        if(datetime.today() > self.deadline):
            raise Exception("Deadline for receive answers has passed.")

        if(author_key in option.voters):
            raise Exception("The user already voted for this option")

        self.options[option.id] = Utils.toJson(option)
        self.put()

    def remove_vote(self, author_key, option):
        """Remove a vote from survey post."""
        if(author_key not in option.voters):
            raise Exception("The user didn't vote for this option")

        self.options[option.id] = Utils.toJson(option)
        self.put()
