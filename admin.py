# coding: utf-8
import webapp2
import json
import datetime
import logging

from google.appengine.api import users

from models import *
from utils import *

def _assert(condition, status_code, msg):
    if condition:
        return

    logging.info("assertion failed: %s" % msg)
    webapp2.abort(status_code, msg)


class BaseHandler(webapp2.RequestHandler):
    def handle_exception(self, exception, debug):
        logging.error(str(exception))
        self.response.write("oops! %s\n" % str(exception))


class InitHandler(BaseHandler):
    def get(self):

        mayza = User()
        mayza.name = 'Mayza Nunes'
        mayza.cpf = '089.675.908-90'
        mayza.photo_url = ''
        mayza.email = 'mayzabeel@gmail.com'
        mayza.institutions = [] 
        mayza.follows = []
        mayza.institutions_admin = []
        mayza.notifications = []
        mayza.posts = []
        mayza.put()

        andre = User()
        andre.name = 'Andre Abrantes'
        andre.cpf = '089.675.908-89'
        andre.photo_url = ''
        andre.email = 'andredossantosabrantes@gmail.com'
        andre.institutions = [] 
        andre.follows = []
        andre.institutions_admin = []
        andre.notifications = []
        andre.posts = []
        andre.put()

        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few users", "projetos_url":"http://localhost:8080/api/user"}')
        self.response.out.write("\n")

        #
        certbio = Institution()
        certbio.name = 'CERTBIO'
        certbio.cnpj = '18.104.068/0001-86'
        certbio.legal_nature = 'public'
        certbio.address =  'Universidade Federal de Campina Grande'
        certbio.occupation_area = ''
        certbio.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
        certbio.image_url = 'https://pbs.twimg.com/profile_images/1782760873/Logo_do_site_400x400.jpg'
        certbio.email = 'certbio@ufcg.edu.br'
        certbio.phone_number = '(83) 3322 4455'
        certbio.members = [mayza.key]
        certbio.followers =  [andre.key]
        certbio.posts = []
        certbio.put()

        #
        splab = Institution()
        splab.name = 'SPLAB'
        splab.cnpj = '18.104.068/0001-56'
        splab.legal_nature = 'public'
        splab.address =  'Universidade Federal de Campina Grande'
        splab.occupation_area = ''
        splab.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
        splab.image_url = 'https://pbs.twimg.com/profile_images/1782760873/Logo_do_site_400x400.jpg'
        splab.email = 'splab@ufcg.edu.br'
        splab.phone_number = '(83) 3322 7865'
        splab.members = [andre.key]
        splab.followers =  [mayza.key]
        splab.posts = []
        splab.put()


        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few institutions", "projetos_url":"http://localhost:8080/api/institution"}')
        self.response.out.write("\n")

        #
        mayza.institutions = [certbio.key] 
        mayza.put()
        andre.institutions = [splab.key] 
        andre.put()

        #POST of Mayza To Certbio Institution
        mayza_post = Post()
        mayza_post.title = "Novo edital do CERTBIO"
        mayza_post.content = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        mayza_post.author = mayza.key
        mayza_post.institution = certbio.key
        mayza_post.put()

        #
        andre_post = Post()
        andre_post.title = "Novo edital do CERTBIO"
        andre_post.content = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        andre_post.author = andre.key
        andre_post.institution = splab.key
        andre_post.put()


        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few posts", "projetos_url":"http://localhost:8080/api/institution"}')
        self.response.out.write("\n")

app = webapp2.WSGIApplication([
    ('/admin/init', InitHandler),
], debug=True)

def erro404(request, response, exception):
    response.write("url invalida: " + str(exception))

app.error_handlers[404] = erro404