pipeline {
    agent any
    environment {
        USER_CREDENTIALS = credentials('srv-jenkins')
        NAME = "assets"
        VERSION = "${env.BUILD_ID}-${env.GIT_COMMIT}"
        IMAGE = "${NAME}:${VERSION}"
        HARBOR_URL = "10.230.7.2"
        HARBOR_PROJECT = "yg-dmz-ns"
    }

    triggers {
        githubPush()
    }


    stages {
        stage('Build and Push') {
            steps {
                script {
                    def app = docker.build("${HARBOR_URL}/${HARBOR_PROJECT}/${NAME}:${VERSION}")
                    docker.withRegistry("https://${HARBOR_URL}", "srv-jenkins-domain") {
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Remove local image') {
            steps {
                sh "docker rmi ${HARBOR_URL}/${HARBOR_PROJECT}/${NAME}:${VERSION}"
            }
        }

        stage('Deploy') {

            steps {
                sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.7.1/wcp/login -k -d \'{"guest_cluster_name":"yg-dmz-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod apply -f yaml/ -n assets --token=$tkc_session'
            }
        }

        stage('Refresh deployments') {

            steps {
                sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.7.1/wcp/login -k -d \'{"guest_cluster_name":"yg-dmz-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod -n assets rollout restart deployment assets --token=$tkc_session'
            }
        }

    }
    post {
        always {
            emailext (
                to: 'mailto:alert-cd@yukon.ca',
                replyTo: 'shu-jun.lin@yukon.ca',
                subject: '$DEFAULT_SUBJECT',
                body: '$DEFAULT_CONTENT , ${GIT_REVISION} is the git commit ID, build number ${BUILD_NUMBER} ',
                mimeType: 'text/html'
            );
        }
        success {
            emailext (
                to: 'michael@icefoganalytics.com',
                subject: '$DEFAULT_SUBJECT',
                body: 'build number ${BUILD_NUMBER} with Git commit hash ${GIT_REVISION} has succeeded',
                mimeType: 'text/html'
            );
            echo 'Build complete'
        }
        failure {
            emailext (
                to: 'michael@icefoganalytics.com',
                subject: '$DEFAULT_SUBJECT',
                body: 'build number ${BUILD_NUMBER} with Git commit hash ${GIT_REVISION} has failed',
                mimeType: 'text/html'
            );
            echo 'Build failed'
        }
    }

}

