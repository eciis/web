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
        survey_post.type_survey = data.get("type_survey")
        survey_post.options = Utils.toJson(data.get("options"))
        survey_post.deadline = datetime.datetime.strptime(
            data.get('deadline'), "%Y-%m-%dT%H:%M:%S")

        survey_post = super(SurveyPost, survey_post).create(
            data, author_key, institution_key)

        return survey_post

    def add_vote(self, author_key, option_id):
        """Add a vote to the survey post."""
        option = self.options[option_id]

        if(self.is_vote_valid(author_key, option)):
            option["number_votes"] += 1
            option["voters"].append(author_key)
            self.options[option_id] = Utils.toJson(option)
            self.put()

    def remove_vote(self, author_key, option_id):
        """Remove a vote from survey post."""
        option = self.options[option_id]

        if(author_key not in option["voters"]):
            raise Exception("The user didn't vote for this option")

        option["number_votes"] -= 1
        option["voters"].remove(author_key)

        self.options[option_id] = Utils.toJson(option)
        self.put()

    def is_vote_valid(self, author_key, option):
        """Verify if vote is valid."""
        if(datetime.datetime.now() > self.deadline):
            raise Exception("Deadline for receive answers has passed.")

        if(author_key in option["voters"]):
            raise Exception("The user already voted for this option")

        return True

    def vote(self, author_key, all_options_selected):
        """Added all votes of user from survey post."""
        if(self.type_survey == "binary" and
                len(all_options_selected) == 1):
            self.add_vote(author_key, all_options_selected[0])
        else:
            for option in all_options_selected:
                self.add_vote(author_key, option)

    @staticmethod
    def make(post, host):
        """Create personalized json of post."""
        post_dict = Post.make(post, host)
        post_dict["deadline"] = post.deadline.isoformat()
        post_dict["type_survey"] = post.type_survey
        post_dict["options"] = post.options if post.options else []

        return post_dict
