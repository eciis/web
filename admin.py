# coding: utf-8
import webapp2
import logging

from models.user import User
from models.institution import Institution
from models.post import Post

class BaseHandler(webapp2.RequestHandler):
    def handle_exception(self, exception, debug):
        logging.error(str(exception))
        self.response.write("oops! %s\n" % str(exception))


class InitHandler(BaseHandler):
    def get(self):

        # new User Mayza
        mayza = User()
        mayza.name = 'Mayza Nunes'
        mayza.cpf = '089.675.908-90'
        mayza.photo_url = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRmhGDdO4jK0eOeEsRfQAohYnkdZeAMUoV3odKlP7D2jsRLP_pXbCHHNw'
        mayza.email = 'mayzabeel@gmail.com'
        mayza.institutions = []
        mayza.follows = []
        mayza.institutions_admin = []
        mayza.notifications = []
        mayza.posts = []
        mayza.put()

        # new User André
        andre = User()
        andre.name = 'André Abrantes'
        andre.cpf = '089.675.908-89'
        andre.photo_url = 'https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAATIAAAAJDY5NDQxOTk2LTUxZmUtNDZkZi04NTdmLTdiN2Y0MDU5YTIxNA.jpg'
        andre.email = 'andredossantosabrantes@gmail.com'
        andre.institutions = []
        andre.follows = []
        andre.institutions_admin = []
        andre.notifications = []
        andre.posts = []
        andre.put()

        # new User Jorge
        jorge = User()
        jorge.name = 'Jorge Abrantes'
        jorge.cpf = '089.675.908-10'
        jorge.photo_url = 'http://www.ceei.ufcg.edu.br/_/rsrc/1472854148636/AssessoriadeComunicacao/noticias/iforumdegestoresdaufcg/0003.jpg?height=150&width=200'
        jorge.email = 'abrantes@dsc.ufcg.edu.br'
        jorge.institutions = []
        jorge.follows = []
        jorge.institutions_admin = []
        jorge.notifications = []
        jorge.posts = []
        jorge.put()

        # new User Dalton
        dalton = User()
        dalton.name = 'Dalton Serey'
        dalton.cpf = '089.675.908-20'
        dalton.photo_url = 'https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/3/000/013/13e/08261fc.jpg'
        dalton.email = 'dalton@splab.ufcg.edu.br'
        dalton.institutions = [] 
        dalton.follows = []
        dalton.institutions_admin = []
        dalton.notifications = []
        dalton.posts = []
        dalton.put()

        # new User Maiana
        maiana = User()
        maiana.name = 'Maiana Brito'
        maiana.cpf = '089.675.908-65'
        maiana.photo_url = ''
        maiana.email = 'maiana.brito@ccc.ufcg.edu.br'
        maiana.institutions = []
        maiana.follows = []
        maiana.institutions_admin = []
        maiana.notifications = []
        maiana.posts = []
        maiana.put()

        # new User Raoni
        raoni = User()
        raoni.name = 'Raoni Smaneoto'
        raoni.cpf = '089.675.908-65'
        raoni.photo_url = ''
        raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
        raoni.institutions = []
        raoni.follows = []
        raoni.institutions_admin = []
        raoni.notifications = []
        raoni.posts = []
        raoni.put()

        # new User Luiz
        luiz = User()
        luiz.name = 'Luiz Silva'
        luiz.cpf = '089.675.908-65'
        luiz.photo_url = ''
        luiz.email = 'luiz.silva@ccc.ufcg.edu.br'
        luiz.institutions = []
        luiz.follows = []
        luiz.institutions_admin = []
        luiz.notifications = []
        luiz.posts = []
        luiz.put()

        # new User Ruan
        ruan = User()
        ruan.name = 'Ruan Silveira'
        ruan.cpf = '089.675.908-65'
        ruan.photo_url = ''
        ruan.email = 'ruan.silveira@ccc.ufcg.edu.br'
        ruan.institutions = []
        ruan.follows = []
        ruan.institutions_admin = []
        ruan.notifications = []
        ruan.posts = []
        ruan.put()

        # new User Tiago
        tiago = User()
        tiago.name = 'Tiago Pereira'
        tiago.cpf = '089.675.908-65'
        tiago.photo_url = ''
        tiago.email = 'tiago.pereira@ccc.ufcg.edu.br'
        tiago.institutions = []
        tiago.follows = []
        tiago.institutions_admin = []
        tiago.notifications = []
        tiago.posts = []
        tiago.put()


        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few users", "projetos_url":"http://localhost:8080/api/user"}')
        self.response.out.write("\n")

        # new Institution CERTBIO with User Mayza like a member and User André like a follower
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
        certbio.members = [mayza.key, dalton.key]
        certbio.followers = [jorge.key, mayza.key, maiana.key, luiz.key, raoni.key, ruan.key, tiago.key]
        certbio.posts = []
        certbio.put()

        # new Institution SPLAB with User André like a member and User Mayza like a follower
        splab = Institution()
        splab.name = 'SPLAB'
        splab.cnpj = '18.104.068/0001-56'
        splab.legal_nature = 'public'
        splab.address = 'Universidade Federal de Campina Grande'
        splab.occupation_area = ''
        splab.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
        splab.image_url = 'http://amaurymedeiros.com/images/splab.png'
        splab.email = 'splab@ufcg.edu.br'
        splab.phone_number = '(83) 3322 7865'
        splab.members = [jorge.key, andre.key]
        splab.followers = [jorge.key, andre.key, maiana.key, luiz.key, raoni.key, ruan.key, tiago.key]
        splab.posts = []
        splab.put()

        eciis = Institution()
        eciis.name = 'e-ciis'
        eciis.cnpj = '18.104.068/0001-30'
        eciis.legal_nature = 'public'
        eciis.address = 'Universidade Federal de Campina Grande'
        eciis.occupation_area = ''
        eciis.description = 'The mission of the e-CIIS \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
        eciis.image_url = 'http://www.paho.org/bra/images/stories/BRA01A/logobireme.jpg'
        eciis.email = 'eciis@ufcg.edu.br'
        eciis.phone_number = '(83) 3322 7865'
        eciis.members = [dalton.key, andre.key, jorge.key, maiana.key, luiz.key, raoni.key, ruan.key, tiago.key]
        eciis.followers = [mayza.key, andre.key, jorge.key, dalton.key, maiana.key, luiz.key, raoni.key, ruan.key, tiago.key]
        eciis.posts = []
        eciis.put()


        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few institutions", "projetos_url":"http://localhost:8080/api/institution"}')
        self.response.out.write("\n")

        # Updating Institutions
        mayza.institutions = [certbio.key]
        mayza.follows = [splab.key, eciis.key, certbio.key]
        mayza.put()
        andre.institutions = [splab.key, eciis.key]
        andre.follows = [splab.key, eciis.key]
        andre.put()
        jorge.institutions = [splab.key, eciis.key]
        jorge.follows = [certbio.key, splab.key, eciis.key]
        jorge.put()
        dalton.institutions = [eciis.key, certbio.key]
        dalton.follows = [splab.key, eciis.key]
        dalton.put()
        maiana.institutions = [eciis.key]
        maiana.follows = [splab.key, eciis.key, certbio.key]
        maiana.put()
        luiz.institutions = [eciis.key]
        luiz.follows = [splab.key, eciis.key, certbio.key]
        luiz.put()
        raoni.institutions = [eciis.key]
        raoni.follows = [splab.key, eciis.key, certbio.key]
        raoni.put()
        ruan.institutions = [eciis.key]
        ruan.follows = [splab.key, eciis.key, certbio.key]
        ruan.put()
        tiago.institutions = [eciis.key]
        tiago.follows = [splab.key, eciis.key, certbio.key]
        tiago.put()

        # POST of Mayza To Certbio Institution
        mayza_post = Post()
        mayza_post.title = "Novo edital do CERTBIO"
        mayza_post.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        mayza_post.author = mayza.key
        mayza_post.institution = certbio.key
        mayza_post.put()

        # POST of Mayza To Certbio Institution with image
        mayza_post_comIMG = Post()
        mayza_post_comIMG.title = "Post do CERTBIO com imagem"
        mayza_post_comIMG.headerImage = "https://workingatbooking.com/content/uploads/2017/04/womenintech_heroimage.jpg"
        mayza_post_comIMG.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent maximus id est in dapibus. Fusce lorem libero, vulputate quis purus maximus, auctor tempus enim. Sed."
        mayza_post_comIMG.author = mayza.key
        mayza_post_comIMG.institution = certbio.key
        mayza_post_comIMG.put()


        # POST of André To SPLAB Institution
        andre_post = Post()
        andre_post.title = "Novo edital do SPLAB"
        andre_post.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        andre_post.author = andre.key
        andre_post.institution = splab.key
        andre_post.put()

        # POST of Dalton To e-CIIS Institution
        dalton_post = Post()
        dalton_post.title = "Post de Dalton no SPLAB"
        dalton_post.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        dalton_post.headerImage = "http://noticias.universia.com.br/net/images/consejos-profesionales/l/le/lei/leia-gratuitamente-livros-alcancar-sucesso-noticias.jpg"
        dalton_post.author = dalton.key
        dalton_post.institution = splab.key
        dalton_post.put()

        # POST of Dalton To CERTBIO Institution
        dalton_postCertbio = Post()
        dalton_postCertbio.title = "Post de Dalton no CERTBIO"
        dalton_postCertbio.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        dalton_postCertbio.author = dalton.key
        dalton_postCertbio.institution = certbio.key
        dalton_postCertbio.put()

        # POST of Jorge To SPLAB Institution
        jorge_post = Post()
        jorge_post.title = "Post de Jorge no SPLAB"
        jorge_post.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        jorge_post.author = jorge.key
        jorge_post.institution = splab.key
        jorge_post.put()


        # POST of Jorge To e-CIIS Institution
        jorge_post_eCIIS = Post()
        jorge_post_eCIIS.title = "Post de Jorge no e-CIIS"
        jorge_post_eCIIS.text = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
        jorge_post_eCIIS.headerImage = "http://unef.edu.br/hotsite/wp-content/uploads/2016/04/EDITAL.jpg"
        jorge_post_eCIIS.author = jorge.key
        jorge_post_eCIIS.institution = eciis.key
        jorge_post_eCIIS.put()

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

        certbio.posts = [dalton_postCertbio.key, mayza_post.key, mayza_post_comIMG.key]
        certbio.put()

        splab.posts = [jorge_post.key, andre_post.key]
        splab.put()

        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.write('{"msg":"database initialized with a few posts", "projetos_url":"http://localhost:8080/api/post"}')
        self.response.out.write("\n")

app = webapp2.WSGIApplication([
    ('/admin/init', InitHandler),
], debug=True)

def erro404(request, response, exception):
    response.write("url invalida: " + str(exception))

app.error_handlers[404] = erro404