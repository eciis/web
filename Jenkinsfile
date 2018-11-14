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
            sh './ecis test client --clean'
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
