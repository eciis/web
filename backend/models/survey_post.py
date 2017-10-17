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

    # The users that voted in this survey
    voters = ndb.KeyProperty(kind="User")

    # Date and time limit that survey will receive answers
    deadline = ndb.DateTimeProperty(required=True)

    @staticmethod
    def create(data, author_key, institution_key):
        """Create a post and check required fields."""
        survey_post = SurveyPost()
        survey_post.options = Utils.toJson(data.get("options"))
        survey_post.deadline = datetime.datetime.strptime(
            data.get('deadline'), "%Y-%m-%dT%H:%M:%S")

        survey_post = Post.create(
            data, survey_post, author_key, institution_key)

        return survey_post

    def add_vote(self, author_key, option_id):
        """Add a vote to the survey post."""
        if(datetime.today() > self.deadline):
            raise Exception("Deadline for receive answers has passed.")
        # When survey is 'binary' the user can vote only one option
        if(author_key in self.voters and
           self.type_survey == 'binary'):
            raise Exception("The user already voted.")

        option = self.options[option_id]
        if(author_key in option.voters):
            raise Exception("The user already voted for this option")

        option.number_votes += 1
        option.voters.append(author_key)
        self.voters.append(author_key)

        self.options[option_id] = Utils.toJson(option)
        self.put()

    def remove_vote(self, author_key, option_id):
        """Remove a vote from survey post."""
        option = self.options[option_id]

        if(author_key not in option.voters):
            raise Exception("The user didn't vote for this option")

        option.number_votes -= 1
        option.voters.remove(author_key)

        self.options[option_id] = Utils.toJson(option)
        self.put()
