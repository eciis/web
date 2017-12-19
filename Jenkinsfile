pipeline {
  agent {
    docker {
      image 'andreldsa/nodejs-python'
      args '--group-add staff --user root'
    }
    
  }
  stages {
    stage('Tests') {
      steps {
        parallel(
          "Backend": {
            sh './ecis test server'
            
          },
          "Frontend": {
            sh '''
                cd frontend/test

                rm -rf node_modules bower_components

                npm install -g bower chai@^3.0.0 chai-as-promised@^5.1.0 jasmine-core karma karma-chai karma-chai-as-promised karma-chrome-launcher karma-jasmine karma-spec-reporter

                npm install

                bower install --allow-root

                karma start --single-run'''            
          }
        )
      }
    }
    stage('Finish') {
      steps {
        cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true, cleanupMatrixParent: true, deleteDirs: true)
      }
    }
  }
  environment {
    GIT_COMMITTER_NAME = 'user'
    GIT_COMMITTER_EMAIL = 'email'
  }
}