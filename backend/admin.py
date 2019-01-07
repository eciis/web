# coding: utf-8
"""Administrator Handlers."""
import webapp2
import logging
import json
import urllib
import hashlib
import permissions

from utils import Utils

from models import User
from models import InstitutionProfile
from models import Institution
from models import Address
from models import Post
from models import Comment
from models import Invite
from models import Event
from models import Feature
from utils import NotAuthorizedException
from google.appengine.ext import ndb
from google.appengine.api import search

INDEX_INSTITUTION = 'institution'
INDEX_USER = 'user'
TEXT = 'At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores et quas molestias excepturi sint occaecati cupiditate \
        non provident, similique sunt in culpa qui officia deserunt mollitia \
        id est laborum et dolorum fuga. Et harum quidem rerum facilis est et \
        xpedita distinctio. Nam libero tempore, cum soluta nobis est eligendi \
        optio cumque nihil impedit quo minus id quod maxime placeat facere \
        possimus, omnis voluptas assumenda est, omnis dolor repellendus. \
        emporibus autem quibusdam et aut officiis debitis aut rerum \
        necessitatibus saepe eveniet ut et voluptates repudiandae sint \
        et molestiae non recusandae. Itaque earum rerum hic tenetur sapiente \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat.'

features = [
    {
        "name": 'manage-inst-edit',
        "enable_mobile": "DISABLED",
        "enable_desktop": "ALL"
    }
]

def reset_features():
    features_query = Feature.query().fetch(keys_only=True)
    ndb.delete_multi(features_query)

    for feature in features:
        Feature.create(**feature)


def add_comments_to_post(user, user_reply, post, institution, comments_qnt=3):
    """Add comments to post."""
    text_A = {'text': 'Lorem ipsum dolor sit amet, at a. Mauris justo ipsum, \
        mauris justo eget, dolor justo. Aliquet amet, \
        mi tristique. Aliquam suspendisse at.', 'institution_key': institution.urlsafe()}
    text_B = {'text': 'Lorem ipsum dolor sit amet, orci id. Eu qui, \
        dui eu curabitur, lacinia justo ante.', 'institution_key': institution.urlsafe()}
    text_C = {'text': 'Lorem ipsum dolor sit amet, faucibus nunc neque ridiculus,\
         platea penatibus fusce mattis. Consectetue ut eleifend ipsum,\
         sapien lacinia montes gravida urna, tortor diam aenean diam vel,\
         augue non lacus vivamus. Tempor sollicitudin adipiscing cras, \
         etiam augue quis vestibulum est, tristique sem placerat.  \
         Et ridiculus sapien in pede, senectus diamlorem in vitae, \
         nunc eget adipiscing vestibulum.', 'institution_key': institution.urlsafe()}

    texts = []
    texts.append(text_A)
    texts.append(text_B)
    texts.append(text_C)
    comments_qnt = comments_qnt if comments_qnt <= 3 else 3
    for i in range(comments_qnt):
        comment = Comment.create(texts[i], user)
        reply = Comment.create({
                'text': 'Comentario',
                'institution_key': institution.urlsafe()
            },
            user_reply)
        comment.replies[reply.id] = Utils.toJson(reply)
        post.add_comment(comment)


def getGravatar(email):
    """Get Gravatar url."""
    default = "https://www.example.com/default.jpg"
    size = 320
    # construct the url
    gravatar_url = "https://www.gravatar.com/avatar/" + \
        hashlib.md5(email[0].lower()).hexdigest() + "?"
    gravatar_url += urllib.urlencode({'d': default, 's': str(size)})
    return gravatar_url


def createInstitution(data, user):
    """Create a new Institution."""

    institutionImage = "http://www.plataformacis.org/images/background01.jpg"
    institution = Institution()
    institution.name = data.get('name')
    institution.acronym = data.get('acronym')
    institution.cnpj = data.get('cnpj')
    institution.legal_nature = data.get('legal_nature')
    institution.address = data.get('address')
    institution.state = data.get('state')
    institution.description = data.get('description')
    institution.phone_number = data.get('phone_number')
    institution.email = data.get('email')
    institution.photo_url = data.get('photo_url') or institutionImage
    institution.admin = user.key
    institution.state = data.get('state')
    institution.leader = data.get('leader')
    institution.institutional_email = data.get('institutional_email')
    institution.actuation_area = data.get('actuation_area')
    institution.website_url = data.get('website_url')
    institution.members.append(user.key)
    institution.followers.append(user.key)
    institution.put()

    user.add_permission("publish_post", institution.key.urlsafe())
    user.add_permission("publish_survey", institution.key.urlsafe())
    user.institutions.append(institution.key)
    user.institutions_admin.append(institution.key)
    user.follows.append(institution.key)
    user.put()

    return institution


def delete_all_in_index(index):
    """Delete all documents in index."""
    try:
        while True:
            document_ids = [
                document.doc_id
                for document
                in index.get_range(ids_only=True)]

            if not document_ids:
                break
            index.delete(document_ids)
    except search.DeleteError:
        logging.exception("Error removing documents")


def create_profile(user, institution):
    """Create a profile."""
    profile = InstitutionProfile()
    profile.email = user.email[0]
    profile.phone = '83 9999-99999'
    profile.institution_key = institution.key.urlsafe()
    profile.institution_name = institution.name
    profile.institution_photo_url = institution.photo_url
    profile.office = 'Employee'
    user.institution_profiles.append(profile)
    user.put()


def clear_data_store():
    # Clean the Datastore
    users = User.query().fetch(keys_only=True)
    ndb.delete_multi(users)

    posts = Post.query().fetch(keys_only=True)
    ndb.delete_multi(posts)

    institutions = Institution.query().fetch(keys_only=True)
    ndb.delete_multi(institutions)

    invites = Invite.query().fetch(keys_only=True)
    ndb.delete_multi(invites)

    events = Event.query().fetch(keys_only=True)
    ndb.delete_multi(events)

    index_institution = search.Index(name=INDEX_INSTITUTION)
    delete_all_in_index(index_institution)
    index_user = search.Index(name=INDEX_USER)
    delete_all_in_index(index_user)


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    def handle_exception(self, exception, debug):
        """Exception."""
        logging.exception(str(exception))
        self.response.write("oops! %s\n" % str(exception))


class ResetHandler(BaseHandler):
    """Init Handler."""

    def get(self):
        """Reset entities."""
        Utils._assert(
            self.request.host in ["backend.plataformacis.org", "backend.eciis-splab.appspot.com"],
            "The production environment can not be redefined",
            NotAuthorizedException
        )

        clear_data_store()
        self.response.headers[
        'Content-Type'] = 'application/json; charset=utf-8'
        response = {"msg": "Datastore Cleaned"}
        self.response.write(json.dumps(response))

        # Initialize the datastore
        jsonList = []
        # new User Julie
        julie = User()
        julie.name = 'Julie Pessoa'
        julie.cpf = '089.675.908-90'
        julie.email = ['pessoajjulie@gmail.com']
        julie.photo_url = getGravatar(julie.email)
        julie.state = 'active'
        julie.put()

        # new User Maiana
        maiana = User()
        maiana.name = 'Maiana Brito'
        maiana.cpf = '089.675.908-65'
        maiana.email = ['maiana.brito@ccc.ufcg.edu.br']
        maiana.photo_url = getGravatar(maiana.email)
        maiana.state = 'active'
        maiana.put()

        # new User Raoni
        raoni = User()
        raoni.name = 'Raoni Smaneoto'
        raoni.cpf = '089.675.908-65'
        raoni.email = ['raoni.smaneoto@ccc.ufcg.edu.br']
        raoni.photo_url = getGravatar(raoni.email)
        raoni.state = 'active'
        raoni.put()

        # new User Luiz
        luiz = User()
        luiz.name = 'Luiz Silva'
        luiz.cpf = '089.675.908-65'
        luiz.email = ['luiz.silva@ccc.ufcg.edu.br']
        luiz.photo_url = getGravatar(luiz.email)
        luiz.state = 'active'
        luiz.put()

        # new User Ruan
        ruan = User()
        ruan.name = 'Ruan Silveira'
        ruan.cpf = '089.675.908-65'
        ruan.email = ['ruan.silveira@ccc.ufcg.edu.br']
        ruan.photo_url = getGravatar(ruan.email)
        ruan.state = 'active'
        ruan.put()

        # new User Tiago
        tiago = User()
        tiago.name = 'Tiago Pereira'
        tiago.cpf = '089.675.908-65'
        tiago.email = ['tiago.pereira@ccc.ufcg.edu.br']
        tiago.photo_url = getGravatar(tiago.email)
        tiago.state = 'active'
        tiago.put()

        # new User Pedro
        pedro = User()
        pedro.name = 'Pedro Espindula'
        pedro.cpf = '089.675.908-65'
        pedro.email = ['joao.espindula@ccc.ufcg.edu.br']
        pedro.photo_url = getGravatar(pedro.email)
        pedro.state = 'active'
        pedro.put()

        # new User Bruno
        bruno = User()
        bruno.name = 'Bruno Siqueira'
        bruno.cpf = '089.675.908-65'
        bruno.email = ['bruno.siqueira@ccc.ufcg.edu.br']
        bruno.photo_url = getGravatar(bruno.email)
        bruno.state = 'active'
        bruno.put()

        # new User Admin
        admin = User()
        admin.name = 'Administrador da Plataforma Virtual CIS'
        admin.cpf = '000.000.000-01'
        admin.email = [
            'deciis@saude.gov.br',
            'plataformavirtualcis@gmail.com'
        ]
        admin.photo_url = "app/images/avatar.png"
        admin.state = 'active'
        admin.put()

        # new User Other Admin
        other_admin = User()
        other_admin.name = 'Teste Admin'
        other_admin.cpf = '089.675.908-65'
        other_admin.email = [
            'testeeciis@gmail.com',
            'teste@eciis.com'
        ]
        other_admin.photo_url = "app/images/avatar.png"
        other_admin.state = 'active'
        other_admin.put()

        commom_users = [julie, maiana, luiz, raoni, ruan, tiago, other_admin, pedro, bruno]

        jsonList.append({"msg": "database initialized with a few users"})

        # new Institution Ministério da Saúde
        address_data = {
            'street': 'Esplanada dos Ministérios Bloco G ',
            'neighbourhood': 'Zona Cívico-Administrativa',
            'city': 'Brasília',
            'cep': '70058-900 ',
            'federal_state': 'Distrito Federal',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Ministério da Saúde',
            'acronym': 'MS',
            'legal_nature': 'PUBLIC',
            'address': address_key,
            'actuation_area': 'GOVERNMENT_AGENCIES',
            'description': 'Ministério da Saúde',
            'photo_url': 'https://i1.wp.com/notta.news/wp-content/uploads/2017/08/tbg_20170713080909_62787.jpg?w=1024',
            'email': 'deciis@saude.gov.br',
            'phone_number': '61 3315-2425',
            'state': 'active',
            'institutional_email':'sic@saude.gov.br',
            'leader':' Ministro Ricardo Barros',
        }
        
        data_deciis = {
            'name': 'Departamento do Complexo Industrial e Inovação em Saúde',
            'acronym': 'DECIIS',
            'legal_nature': 'PUBLIC',
            'address': address_key,
            'actuation_area': 'GOVERNMENT_AGENCIES',
            'description': 'Departamento do Complexo Industrial e Inovação em Saúde',
            'photo_url': 'http://www.plataformacis.org/images/logo.png',
            'email': 'deciis@saude.gov.br',
            'state': 'active',
            'institutional_email':'deciis@saude.gov.br',
            'leader':' Ministro Ricardo Barros'
        }

        ms = createInstitution(data, admin)
        deciis = createInstitution(data_deciis, admin)
        deciis.trusted = True
        
        for user in (commom_users + [admin]):
            user.follow(deciis.key)
            user.follow(ms.key)
            deciis.follow(user.key)
            ms.follow(user.key)
        deciis.put()
        ms.put()

        admin.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, ms.key.urlsafe())
        create_profile(admin, ms)

        admin.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, deciis.key.urlsafe())
        admin.add_permissions(permissions.DEFAULT_SUPER_USER_PERMISSIONS, deciis.key.urlsafe())
        create_profile(admin, deciis)
        admin.put()

        address_data = {
            'number': '882',
            'street': 'Avenida Aprígio Veloso',
            'neighbourhood': 'Universitário',
            'city': 'Campina Grande',
            'federal_state': 'Paraíba',
            'cep': '58428-830',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Laboratório de Avaliação e Desenvolvimento de Biomateriais do Nordeste',
            'acronym': 'CERTBIO',
            'cnpj': '18.104.068/0001-86',
            'legal_nature': 'PUBLIC',
            'address': address_key,
            'actuation_area': 'RESEARCH_INSTITUTE',
            'description': 'Ensaio Químico - Determinação de Material Volátil por Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade',
            'photo_url': 'https://pbs.twimg.com/profile_images/1782760873/Logo_do_site_400x400.jpg',
            'email': 'certbio@ufcg.edu.br',
            'institutional_email':'certbio@ufcg.edu.br',
            'phone_number': '83 3322-4455',
            'state': 'active',
            'leader': 'User'
        }

        certbio = createInstitution(data, other_admin)
        for user in [julie, other_admin]:
            certbio.add_member(user)
            user.add_institution(certbio.key)
            user.follow(certbio.key)
            create_profile(user, certbio)
        for user in commom_users:
            certbio.follow(user.key)
            user.follow(certbio.key)

        address_data = {
            'number': '1445',
            'street': 'Rua Dom Pedro II',
            'neighbourhood': 'Prata',
            'city': 'Campina Grande',
            'cep': '58400-565',
            'federal_state': 'Paraíba',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Software Practice Laboratory',
            'acronym': 'SPLAB',
            'cnpj': '18.104.068/0001-56',
            'legal_nature': 'PUBLIC',
            'address': address_key,
            'actuation_area': 'COLLEGE',
            'description': """The mission of the Software Practices Laboratory (SPLab) is to promote the development of the state-of-the-art in the theory and practice of Software Engineering.""",
            'email': 'splab@ufcg.edu.br',
            'institutional_email':'splab@ufcg.edu.br',
            'phone_number': '83 3322-7865',
            'state': 'active',
            'leader': 'User'
        }

        splab = createInstitution(data, other_admin)
        for user in [other_admin]:
            splab.add_member(user)
            user.add_institution(splab.key)
            user.follow(splab.key)
            create_profile(user, splab)

        for user in commom_users:
            splab.follow(user.key)
            user.follow(splab.key)

        # new Institution eciis
        address_data = {
            'number': '456',
            'street': 'Rua Francisco Lopes',
            'neighbourhood': 'Centenário',
            'city': 'Campina Grande',
            'cep': '58428-080',
            'federal_state': 'Paraíba',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Complexo Industrial da Saude',
            'acronym': 'e-ciis',
            'cnpj': '18.104.068/0001-30',
            'legal_nature': 'PUBLIC',
            'address': address_key,
            'actuation_area': 'COLLEGE',
            'description': 'The mission of the e-CIIS is to promote the development of the state-of-the-art in the theory and practice of Software Engineering.',
            'photo_url': 'http://www.paho.org/bra/images/stories/BRA01A/logobireme.jpg',
            'email': 'eciis@ufcg.edu.br',
            'institutional_email':'eciis@ufcg.edu.br',
            'phone_number': '83 3322-7865',
            'state': 'active',
            'leader': 'User'
        }

        eciis = createInstitution(data, other_admin)
        for user in commom_users:
            eciis.add_member(user)
            user.add_institution(eciis.key)
            user.follow(eciis.key)
            create_profile(user, eciis)

        for user in commom_users:
            eciis.follow(user.key)

        eciis.parent_institution = splab.key
        eciis.put()

        splab.children_institutions = [eciis.key]
        splab.put()

        jsonList.append(
            {"msg": "database initialized with a few institutions"})

        other_admin.institutions_admin = [certbio.key, eciis.key, splab.key]
        
        other_admin.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, certbio.key.urlsafe())
        other_admin.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, splab.key.urlsafe())
        other_admin.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, eciis.key.urlsafe())
        other_admin.put()

        # POST of Julie To Certbio Institution
        julie_post = Post()
        julie_post.title = "Novo edital do CERTBIO"
        julie_post.text = TEXT
        julie_post.author = julie.key
        julie_post.institution = certbio.key
        julie_post.last_modified_by = julie.key
        julie_post.put()
        add_comments_to_post(julie,maiana, julie_post, julie.institutions[0], 2)
        julie.add_permissions(['edit_post', 'remove_post'], julie_post.key.urlsafe())

        # POST of Julie To Certbio Institution with image
        post_with_image = Post()
        post_with_image.title = "Post do CERTBIO com imagem"
        post_with_image.photo_url = "https://workingatbooking.com/content/uploads/2017/04/womenintech_heroimage.jpg"
        post_with_image.text = TEXT
        post_with_image.author = julie.key
        post_with_image.institution = certbio.key
        post_with_image.last_modified_by = julie.key
        post_with_image.put()
        add_comments_to_post(julie,raoni, post_with_image,
                             julie.institutions[0], 1)
        julie.add_permissions(['edit_post', 'remove_post'], post_with_image.key.urlsafe())

        # Side efect of a post
        julie.posts = [julie_post.key, post_with_image.key]
        julie.put()

        eciis.posts = []
        eciis.put()

        certbio.posts = [julie_post.key]
        certbio.put()

        splab.posts = []
        splab.put()

        reset_features()

        jsonList.append({"msg": "database initialized with a few posts"})

        self.response.write(json.dumps(jsonList))

class ResetFeaturesHandler(BaseHandler):
    def get(self):
        reset_features()
        self.response.write({"msg": "database initialized with a few features"})

app = webapp2.WSGIApplication([
    ('/admin/reset', ResetHandler),
    ('/admin/reset-features', ResetFeaturesHandler)
], debug=True)


def erro404(request, response, exception):
    response.write("url invalida: " + str(exception))

app.error_handlers[404] = erro404
