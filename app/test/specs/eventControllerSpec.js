'use strict';

(describe('Test EventController', function() {

    var shareCtrl, scope, httpBackend, rootScope, mdDialog, postService, deffered, state;

    var splab = {name: 'Splab', key: '098745'};

    var maiana = {
        name: 'Maiana',
        institutions: [splab],
        follows: splab,
        institutions_admin: splab[0],
        current_institution: splab[0]
    };

    maiana.current_institution = splab;

    // Post of e-CIS by Maiana
    var event = new Event({'title': 'Inauguração',
                         'text': 'Inaugurar o projeto E-CIS',
                         'photo_url': null,
                         'key': '12300'
                        },
                        splab.key);
}));