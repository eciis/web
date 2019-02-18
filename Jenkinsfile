pipeline {
  agent {
    docker {
      image 'eciis/nodejs-python'
      args '--group-add staff --user root'
    }
    
  }
  stages {
    stage('Tests') {
      steps {
        parallel(
          "Backend": {
            sh './ecis test server --clean'
            
          },
          "Frontend": {
            sh '''
                cd frontend/test

                rm -rf node_modules bower_components

                npm install -g bower chai@^3.0.0 chai-as-promised@^5.1.0 jasmine-core@2.99.0 karma karma-chai karma-chai-as-promised karma-chrome-launcher karma-jasmine@1.1.0 karma-spec-reporter

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
  post {
    success {
      slackSend(color: '#689F38', message: "SUCCESS: Build <${env.BUILD_URL}display/redirect|#${env.BUILD_NUMBER}> of *${env.JOB_NAME}*")
      
    }
    
    failure {
      slackSend(color: '#d32f2f', message: "FAILED: Build <${env.BUILD_URL}display/redirect|#${env.BUILD_NUMBER}> of *${env.JOB_NAME}*")
      
    }
    
  }
}