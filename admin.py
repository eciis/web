# coding: utf-8
"""Administrator Handlers."""
import webapp2
import logging
import json
import urllib
import hashlib

from utils import Utils

from models.user import User
from models.user import InstitutionProfile
from models.institution import Institution
from models.institution import Address
from models.post import Post
from models.post import Comment
from models.invite import Invite
from google.appengine.ext import ndb
import search_module
from google.appengine.api import search

INDEX_NAME = 'institution'


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
    size = 40
    # construct the url
    gravatar_url = "https://www.gravatar.com/avatar/" + \
        hashlib.md5(email.lower()).hexdigest() + "?"
    gravatar_url += urllib.urlencode({'d': default, 's': str(size)})
    return gravatar_url


def createInstitution(data, user):
    """Create a new Institution."""

    institutionImage = "http://eciis-splab.appspot.com/images/institution.jpg"
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
    institution.members.append(user.key)
    institution.followers.append(user.key)
    institution.put()

    user.add_permission("publish_post", institution.key.urlsafe())
    user.institutions.append(institution.key)
    user.institutions_admin.append(institution.key)
    user.follows.append(institution.key)
    user.put()
    search_module.createDocument(institution)

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
    profile.email = user.email
    profile.phone = '(83) 99999-9999'
    profile.institution_key = institution.key.urlsafe()
    profile.institution_name = institution.name
    profile.institution_photo_url = institution.photo_url
    profile.office = 'Employee'
    user.institution_profiles.append(profile)
    user.put()


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    def handle_exception(self, exception, debug):
        """Exception."""
        logging.error(str(exception))
        self.response.write("oops! %s\n" % str(exception))


class ResetHandler(BaseHandler):
    """Init Handler."""

    def get(self):
        """Reset entities."""
        # Clean the Datastore
        users = User.query().fetch(keys_only=True)
        ndb.delete_multi(users)

        posts = Post.query().fetch(keys_only=True)
        ndb.delete_multi(posts)

        institutions = Institution.query().fetch(keys_only=True)
        ndb.delete_multi(institutions)

        invites = Invite.query().fetch(keys_only=True)
        ndb.delete_multi(invites)

        index = search.Index(name=INDEX_NAME)
        delete_all_in_index(index)

        self.response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        response = {"msg": "Datastore Cleaned"}
        self.response.write(json.dumps(response))

        # Initialize the datastore
        jsonList = []
        # new User Mayza
        mayza = User()
        mayza.name = 'Mayza Nunes'
        mayza.cpf = '089.675.908-90'
        mayza.email = 'mayzabeel@gmail.com'
        mayza.photo_url = getGravatar(mayza.email)
        mayza.institutions = []
        mayza.follows = []
        mayza.institutions_admin = []
        mayza.notifications = []
        mayza.posts = []
        mayza.state = 'active'
        mayza.put()

        # new User André
        andre = User()
        andre.name = 'André Abrantes'
        andre.cpf = '089.675.908-89'
        andre.email = 'andredossantosabrantes@gmail.com'
        andre.photo_url = getGravatar(andre.email)
        andre.institutions = []
        andre.follows = []
        andre.institutions_admin = []
        andre.notifications = []
        andre.posts = []
        andre.state = 'active'
        andre.put()

        # new User Jorge
        jorge = User()
        jorge.name = 'Jorge Abrantes'
        jorge.cpf = '089.675.908-10'
        jorge.email = 'jcafigueiredo@gmail.com'
        jorge.photo_url = getGravatar(jorge.email)
        jorge.institutions = []
        jorge.follows = []
        jorge.institutions_admin = []
        jorge.notifications = []
        jorge.posts = []
        jorge.state = 'active'
        jorge.put()

        # new User Dalton
        dalton = User()
        dalton.name = 'Dalton Serey'
        dalton.cpf = '089.675.908-20'
        dalton.email = 'dalton@splab.ufcg.edu.br'
        dalton.photo_url = getGravatar(dalton.email)
        dalton.institutions = []
        dalton.follows = []
        dalton.institutions_admin = []
        dalton.notifications = []
        dalton.posts = []
        dalton.state = 'active'
        dalton.put()

        # new User Maiana
        maiana = User()
        maiana.name = 'Maiana Brito'
        maiana.cpf = '089.675.908-65'
        maiana.email = 'maiana.brito@ccc.ufcg.edu.br'
        maiana.photo_url = getGravatar(maiana.email)
        maiana.institutions = []
        maiana.follows = []
        maiana.institutions_admin = []
        maiana.notifications = []
        maiana.posts = []
        maiana.state = 'active'
        maiana.put()

        # new User Raoni
        raoni = User()
        raoni.name = 'Raoni Smaneoto'
        raoni.cpf = '089.675.908-65'
        raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
        raoni.photo_url = getGravatar(raoni.email)
        raoni.institutions = []
        raoni.follows = []
        raoni.institutions_admin = []
        raoni.notifications = []
        raoni.posts = []
        raoni.state = 'active'
        raoni.put()

        # new User Luiz
        luiz = User()
        luiz.name = 'Luiz Silva'
        luiz.cpf = '089.675.908-65'
        luiz.email = 'luiz.silva@ccc.ufcg.edu.br'
        luiz.photo_url = getGravatar(luiz.email)
        luiz.institutions = []
        luiz.follows = []
        luiz.institutions_admin = []
        luiz.notifications = []
        luiz.posts = []
        luiz.state = 'active'
        luiz.put()

        # new User Ruan
        ruan = User()
        ruan.name = 'Ruan Silveira'
        ruan.cpf = '089.675.908-65'
        ruan.email = 'ruan.silveira@ccc.ufcg.edu.br'
        ruan.photo_url = getGravatar(ruan.email)
        ruan.institutions = []
        ruan.follows = []
        ruan.institutions_admin = []
        ruan.notifications = []
        ruan.posts = []
        ruan.state = 'active'
        ruan.put()

        # new User Tiago
        tiago = User()
        tiago.name = 'Tiago Pereira'
        tiago.cpf = '089.675.908-65'
        tiago.email = 'tiago.pereira@ccc.ufcg.edu.br'
        tiago.photo_url = getGravatar(tiago.email)
        tiago.institutions = []
        tiago.follows = []
        tiago.institutions_admin = []
        tiago.notifications = []
        tiago.posts = []
        tiago.state = 'active'
        tiago.put()

        # new User Admin
        admin = User()
        admin.name = 'Administrador do e-CIS'
        admin.cpf = '089.675.908-65'
        admin.email = 'testeeciis@gmail.com'
        admin.photo_url = 'images/avatar.jpg'
        admin.institutions = []
        admin.follows = []
        admin.institutions_admin = []
        admin.notifications = []
        admin.posts = []
        admin.state = 'active'
        admin.put()

        jsonList.append({"msg": "database initialized with a few users"})

        # new Institution CERTBIO with User Mayza like a member
        # and User André like a follower
        address_data = {
            'number': '882',
            'street': 'Avenida Aprígio Veloso',
            'neighbourhood': 'Universitário',
            'city': 'Campina Grande',
            'state': 'Paraíba',
            'cep': '58428-830',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Laboratório de Avaliação e Desenvolvimento de Biomateriais do Nordeste',
            'acronym': 'CERTBIO',
            'cnpj': '18.104.068/0001-86',
            'legal_nature': 'public',
            'address': address_key,
            'occupation_area': 'research institutes',
            'description': 'Ensaio Químico - Determinação de Material Volátil por Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade',
            'photo_url': 'https://pbs.twimg.com/profile_images/1782760873/Logo_do_site_400x400.jpg',
            'email': 'certbio@ufcg.edu.br',
            'phone_number': '83 33224455',
            'state': 'active'
        }

        certbio = createInstitution(data, admin)
        for user in [mayza, dalton, admin]:
            certbio.add_member(user)
            user.add_institution(certbio.key)
            user.follow(certbio.key)
            create_profile(user, certbio)
        for user in [jorge, mayza, maiana, luiz,
                     raoni, ruan, tiago, admin]:
            certbio.follow(user.key)
            user.follow(certbio.key)

        # new Institution SPLAB with User André like a member
        # and User Mayza like a follower
        address_data = {
            'number': '1445',
            'street': 'Rua Dom Pedro II',
            'neighbourhood': 'Prata',
            'city': 'Campina Grande',
            'cep': '58400-565',
            'state': 'Paraíba',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Software Practice Laboratory',
            'acronym': 'SPLAB',
            'cnpj': '18.104.068/0001-56',
            'legal_nature': 'public',
            'address': address_key,
            'occupation_area': 'college',
            'description': """The mission of the Software Practices Laboratory (SPLab) is to promote the development of the state-of-the-art in the theory and practice of Software Engineering.""",
            'photo_url': 'http://amaurymedeiros.com/images/splab.png',
            'email': 'splab@ufcg.edu.br',
            'phone_number': '83 33227865',
            'state': 'active'
        }

        splab = createInstitution(data, admin)
        for user in [jorge, andre, admin]:
            splab.add_member(user)
            user.add_institution(splab.key)
            user.follow(splab.key)
            create_profile(user, splab)

        for user in [jorge, andre, maiana, luiz,
                     raoni, ruan, tiago, admin]:
            splab.follow(user.key)
            user.follow(splab.key)

        # new Institution eciis
        address_data = {
            'number': '456',
            'street': 'Rua Francisco Lopes',
            'neighbourhood': 'Centenário',
            'city': 'Campina Grande',
            'cep': '58428-080',
            'state': 'Paraíba',
            'country': 'Brasil'
        }
        address_key = Address.create(address_data)

        data = {
            'name': 'Complexo Industrial da Saude',
            'acronym': 'e-ciis',
            'cnpj': '18.104.068/0001-30',
            'legal_nature': 'public',
            'address': address_key,
            'occupation_area': 'college',
            'description': 'The mission of the e-CIIS is to promote the development of the state-of-the-art in the theory and practice of Software Engineering.',
            'photo_url': 'http://www.paho.org/bra/images/stories/BRA01A/logobireme.jpg',
            'email': 'eciis@ufcg.edu.br',
            'phone_number': '83 33227865',
            'state': 'active'
        }

        eciis = createInstitution(data, admin)
        for user in [dalton, andre, jorge, maiana,
                     luiz, raoni, ruan, tiago, mayza, admin]:
            eciis.add_member(user)
            user.add_institution(eciis.key)
            user.follow(eciis.key)
            create_profile(user, eciis)

        for user in [mayza, andre, jorge, dalton,
                     maiana, luiz, raoni,
                     ruan, tiago, admin]:
            eciis.follow(user.key)

        eciis.parent_institution = splab.key
        eciis.put()

        splab.children_institutions = [eciis.key]
        splab.put()

        jsonList.append(
            {"msg": "database initialized with a few institutions"})

        admin.institutions_admin = [certbio.key, eciis.key, splab.key]
        admin.put()

        # POST of Mayza To Certbio Institution
        mayza_post = Post()
        mayza_post.title = "Novo edital do CERTBIO"
        mayza_post.text = "At vero eos et accusamus et iusto odio dignissimos \
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
        aut perferendis doloribus asperiores repellat."
        mayza_post.author = mayza.key
        mayza_post.institution = certbio.key
        mayza_post.last_modified_by = mayza.key
        mayza_post.put()
        add_comments_to_post(mayza, andre, mayza_post, mayza.institutions[0], 2)

        # POST of Mayza To Certbio Institution with image
        mayza_post_comIMG = Post()
        mayza_post_comIMG.title = "Post do CERTBIO com imagem"
        mayza_post_comIMG.photo_url = "https://workingatbooking.com/content/uploads/2017/04/womenintech_heroimage.jpg"
        mayza_post_comIMG.text = "Lorem ipsum dolor sit amet, consectetur \
        adipiscing elit. Praesent maximus id est in dapibus. Fusce lorem \
        libero, vulputate quis purus maximus, auctor tempus enim. Sed."
        mayza_post_comIMG.author = mayza.key
        mayza_post_comIMG.institution = certbio.key
        mayza_post_comIMG.last_modified_by = mayza.key
        mayza_post_comIMG.put()
        add_comments_to_post(mayza, jorge, mayza_post_comIMG,
                             mayza.institutions[0], 1)

        # POST of André To SPLAB Institution
        andre_post = Post()
        andre_post.title = "Novo edital do SPLAB"
        andre_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores et quas molestias excepturi sint occaecati cupiditate non\
        provident, similique sunt in culpa qui officia deserunt mollitia animi\
        id est laborum et dolorum fuga. Et harum quidem rerum facilis est et\
        expedita distinctio. Nam libero tempore, cum soluta nobis est eligen\
        i optio cumque nihil impedit quo minus  quod maxime placeat facere \
        possimus, omnis voluptas assumenda est, omnis dolor repellendus. \
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessi\
        tatibus saepe eveniet ut et voluptates repudiandae sint et molestiae\
        non recusandae. Itaque earum rerum hic tenetur a sapiente delectus,\
        ut aut reiciendis voluptatibus maiores alias consequatur aut perf\
        erendis doloribus asperiores repellat."
        andre_post.author = andre.key
        andre_post.institution = splab.key
        andre_post.last_modified_by = andre.key
        andre_post.put()
        add_comments_to_post(andre, mayza, andre_post, andre.institutions[0], 3)

        # POST of Dalton To e-cis Institution
        dalton_post = Post()
        dalton_post.title = "Post de Dalton no SPLAB"
        dalton_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores  quas molestias excepturi sint occaecati cupiditate non \
        provident, similique sunt  culpa qui officia deserunt mollitia animi,\
        id est laborum et dolorum fuga. Et harum quidem rerum facilis est et \
        expedita distinctio. Nam libero tempore, c soluta nobis est eligendi\
        optio cumque nihil impedit quo minus id quod maxime placeat facere \
        possimus, omnis voluptas assumenda est, omnis dolor repellendus.\
        Temporibusautem quibusdam et aut officiis debitis aut rerum necessitat\
        ibus saepe eveniet ut et voluptates repudiandae sint et molestiae non \
        recusandae. Itaque earum rerum hic tenetur sapiente delectus, ut aut \
        reiciendis voluptatibus maiores alias consequatur aut perferendis dolo\
        ribus asperiores repellat."
        dalton_post.photo_url = "http://noticias.universia.com.br/net/images/consejos-profesionales/l/le/lei/leia-gratuitamente-livros-alcancar-sucesso-noticias.jpg"
        dalton_post.author = dalton.key
        dalton_post.institution = splab.key
        dalton_post.last_modified_by = dalton.key
        dalton_post.put()
        add_comments_to_post(dalton, jorge, dalton_post, dalton.institutions[0], 2)

        # POST of Dalton To CERTBIO Institution
        dalton_postCertbio = Post()
        dalton_postCertbio.title = "Post de Dalton no CERTBIO"
        dalton_postCertbio.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        dalton_postCertbio.author = dalton.key
        dalton_postCertbio.institution = certbio.key
        dalton_postCertbio.last_modified_by = dalton.key
        dalton_postCertbio.put()
        add_comments_to_post(dalton, jorge, dalton_postCertbio,
                             dalton.institutions[0], 1)

        # POST of Jorge To SPLAB Institution
        jorge_post = Post()
        jorge_post.title = "Post de Jorge no SPLAB"
        jorge_post.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        jorge_post.author = jorge.key
        jorge_post.institution = splab.key
        jorge_post.last_modified_by = jorge.key
        jorge_post.put()

        # POST of Jorge To e-cis Institution
        jorge_post_eCIIS = Post()
        jorge_post_eCIIS.title = "Post de Jorge no e-cis"
        jorge_post_eCIIS.text = "At vero eos et accusamus et iusto odio dignis\
        simos ducimus quiblanditiis praesentium voluptatum deleniti atque corr\
        pti quos dolores et quas molestias excepturi sint occaecati cupiditate\
        non provident, similique sunt in culpa qui officia deserunt mollitia \
        animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis e\
        et expedita distinctio. Nam libero tempore, cum soluta nobis est elige\
        ndi optio cumque nihil impedit quo minus id quod maxime placeat facere\
        possimus, omnis voluptas assumenda est, omnis dolor repellendus. \
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessit\
        atibus saepe eveniet ut et voluptates repudiandae sint et molestiae \
        non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, \
        ut aut reiciendis voluptatibus maiores alias consequatur aut perferend\
        is doloribus asperiores repellat."
        jorge_post_eCIIS.photo_url = "http://unef.edu.br/hotsite/wp-content/uploads/2016/04/EDITAL.jpg"
        jorge_post_eCIIS.author = jorge.key
        jorge_post_eCIIS.institution = eciis.key
        jorge_post_eCIIS.last_modified_by = jorge.key
        jorge_post_eCIIS.put()
        add_comments_to_post(jorge, mayza, jorge_post_eCIIS, jorge.institutions[0], 3)

        # Side efect of a post
        jorge.posts = [jorge_post.key, jorge_post_eCIIS.key]
        jorge.put()

        dalton.posts = [dalton_postCertbio.key, dalton_post.key]
        dalton.put()

        andre.posts = [andre_post.key]
        andre.put()

        mayza.posts = [mayza_post.key, mayza_post_comIMG.key]
        mayza.put()

        eciis.posts = [jorge_post_eCIIS.key, dalton_post.key]
        eciis.put()

        certbio.posts = [dalton_postCertbio.key,
                         mayza_post.key, mayza_post_comIMG.key]
        certbio.put()

        splab.posts = [jorge_post.key, andre_post.key]
        splab.put()

        jsonList.append({"msg": "database initialized with a few posts"})

        self.response.write(json.dumps(jsonList))


app = webapp2.WSGIApplication([
    ('/admin/reset', ResetHandler),
], debug=True)


def erro404(request, response, exception):
    response.write("url invalida: " + str(exception))

app.error_handlers[404] = erro404
