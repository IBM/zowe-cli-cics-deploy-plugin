/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
* Copyright IBM Corp, 2019.
*                                                                                 *
*/

// The following property need to be set for the HTML report @TODO figure out how to get this nicely on jenkins
//System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")

/**
 * The following flags are switches to control which stages of the pipeline to be run.  This is helpful when 
 * testing a specific stage of the pipeline.
 */
def PIPELINE_CONTROL = [
    build: true,
    unit_test: true,    
    system_test: true,
    cd_skip: false
]

/**
 * The result strings for a build status
 */
def BUILD_RESULT = [
    success: 'SUCCESS',
    unstable: 'UNSTABLE',
    failure: 'FAILURE'
]

/**
 * Test npm registry
 */
def TEST_NPM_REGISTRY = "https://eu.artifactory.swg-devops.com/artifactory/api/npm/cicsts-npm-virtual"

/**
 * npm registry 
 */
def NPM_REGISTRY = "registry.npmjs.org"
def NPM_FULL_REGISTRY = "https://registry.npmjs.org"

/**
 * The root results folder for items configurable by environmental variables
 */
def TEST_RESULTS_FOLDER = "__tests__/__results__" 

/**
 * The location of the unit test results
 */
def UNIT_RESULTS = "${TEST_RESULTS_FOLDER}/unit"

/**
 * The location of the system test results
 */
def SYSTEM_RESULTS = "${TEST_RESULTS_FOLDER}/system"

/**
 * The name of the master branch
 */
def MASTER_BRANCH = "master"

/**
 * The name of the dev branch
 */
def DEV_BRANCH = "dev"

/**
 * Release branches
 */
def RELEASE_BRANCHES = [MASTER_BRANCH, DEV_BRANCH]

/** 
 * Branches to send notifcations for
*/
def NOTIFY_BRANCHES = [MASTER_BRANCH, DEV_BRANCH]


/**
 * Variables to check any new commit since the previous successful commit
 */
def GIT_COMMIT = "null"
def GIT_PREVIOUS_SUCCESSFUL_COMMIT = "null"

/**
 * This is the product name used by the build machine to store information about
 * the builds
 */
def PRODUCT_NAME = "zowe-cli-cics-deploy-plugin"

/**
 * This is where the Zowe project needs to be installed
 */
def ZOWE_CLI_INSTALL_DIR = "/.npm-global/lib/node_modules/@brightside/core"

def ARTIFACTORY_CREDENTIALS_ID = "c8e3aa62-5eef-4e6b-8a3f-aa1006a7ef01"

// Setup conditional build options. Would have done this in the options of the declarative pipeline, but it is pretty
// much impossible to have conditional options based on the branch :/
def opts = []

// Setup a schedule to run build periodically
// Run a build at 2.00AM everyday
def CRON_STRING = RELEASE_BRANCHES.contains(BRANCH_NAME) ? "H 2 * * *" : ""

if (RELEASE_BRANCHES.contains(BRANCH_NAME)) {
    // Only keep 20 builds
    opts.push(buildDiscarder(logRotator(numToKeepStr: '20')))

    // Concurrent builds need to be disabled on the master branch because
    // it needs to actively commit and do a build. There's no point in publishing
    // twice in quick succession
    opts.push(disableConcurrentBuilds())
} else {
    // Only keep 5 builds on other branches
    opts.push(buildDiscarder(logRotator(numToKeepStr: '5')))
}

properties(opts)

pipeline {

    agent any

    options {
        skipDefaultCheckout true
    }

    triggers {
        cron(CRON_STRING)
    }

    environment {
        // Environment variable for flow control. Indicates if the git source was updated by the pipeline.
        GIT_SOURCE_UPDATED = "false"

        // Tell npm to install global packages within the workspace dir, and add it 
        // to PATH. This allows us to do a global install for Zowe without affect
        // other Jenkins jobs or needing root access.
        NPM_CONFIG_PREFIX = "${WORKSPACE}/npm-global"
        PATH = "${NPM_CONFIG_PREFIX}/bin:${PATH}"

        // Credential to publish to npmjs.org
        // NPM_CREDENTIALS_USR is email address
        // NPM_REDENTIALS_PSW is the login token
        NPM_CREDENTIALS = credentials('ibmcics.npmjs.auth.token')
    }

    stages {
        stage("Clean workspace and checkout source") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        cleanWs()
                        scmInfo = checkout scm

                        GIT_COMMIT = scmInfo.GIT_COMMIT
                        GIT_PREVIOUS_SUCCESSFUL_COMMIT = scmInfo.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                    }
                }
            }
        } 

        /************************************************************************
         * STAGE
         * -----
         * Install Zowe CLI
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.build is true or PIPELINE_CONTROL.smoke_test is true
         *
         * DESCRIPTION
         * -----------
         * Install Zowe CLI globally to be used to build the plugin and install
         * plugin to for smoke test
         *
         * OUTPUTS
         * -------
         * Able to issue zowe commands.
         ************************************************************************/
        stage('Install Zowe CLI') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.build || PIPELINE_CONTROL.smoke_test
                    }
                }
            }
            steps('Install Zowe CLI') {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Install Zowe CLI globaly"
                    sh "rm -f .npmrc"
                    sh "npm set registry https://registry.npmjs.org"
                    sh "npm set @brightside:registry=https://api.bintray.com/npm/ca/brightside/"

                    sh "npm install -g @brightside/core@lts-incremental"
                    sh "zowe --version"
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Install Dependencies
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.build is true
         *
         * DESCRIPTION
         * -----------
         * Logs into the open source registry and installs all the dependencies
         *
         * OUTPUTS
         * -------
         * None
         ************************************************************************/
        stage('Install Dependencies') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Installing Dependencies'
                    sh 'npm config ls'
                    sh 'npm install'
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Build
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.build is true
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run build` command to generate the application code.
         *
         * OUTPUTS
         * -------
         * Jenkins: Compiled application executable code
         ************************************************************************/
        stage('Build') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Build'
                    sh 'node --version'
                    sh "echo '${ZOWE_CLI_INSTALL_DIR}' | npm run build"

                    sh 'tar -czvf BuildArchive.tar.gz ./lib/'
                    archiveArtifacts 'BuildArchive.tar.gz'

                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Test: Unit
         *
         * TIMEOUT
         * -------
         * 10 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.unit_test is true
         *
         * ENVIRONMENT VARIABLES
         * ---------------------
         * JEST_JUNIT_OUTPUT:
         * Configures the jest junit reporter's output location.
         *
         * JEST_SUITE_NAME:
         * Configures the test suite name.
         *
         * JEST_JUNIT_ANCESTOR_SEPARATOR
         * Configures the separator used for nested describe blocks.
         *
         * JEST_JUNIT_CLASSNAME:
         * Configures how test class names are output.
         *
         * JEST_JUNIT_TITLE:
         * Configures the title of the tests.
         *
         * JEST_STARE_RESULT_DIR:
         * Configures the jest stare result output directory.
         *
         * JEST_STARE_RESULT_HTML:
         * Configures the jest stare result html file name.
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run test:unit` command to perform unit tests and
         * captures the resulting html and junit outputs.
         *
         * OUTPUTS
         * -------
         * Jenkins: Unit Test Report (through junit plugin)
         * HTML: Unit Test Report
         * HTML: Unit Test Code Coverage Report
         ************************************************************************/
        stage('Test: Unit') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.unit_test
                    }
                }
            }
            environment {
                JEST_JUNIT_OUTPUT = "${UNIT_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "Unit Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="Unit.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_STARE_RESULT_DIR = "${UNIT_RESULTS}/jest-stare"
                JEST_STARE_RESULT_HTML = "index.html"
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Unit Test'

                    // Run tests but don't fail if the script reports an error
                    sh "npm run test:unit || exit 0"

                    // Capture test report
                    junit JEST_JUNIT_OUTPUT

                    cobertura autoUpdateHealth: false,
                            autoUpdateStability: false,
                            coberturaReportFile: "${UNIT_RESULTS}/coverage/cobertura-coverage.xml",
                            failUnhealthy: false,
                            failUnstable: false,
                            onlyStable: false,
                            zoomCoverageChart: false,
                            maxNumberOfBuilds: 20,
                            // classCoverageTargets: '85, 80, 75',
                            // conditionalCoverageTargets: '70, 65, 60',
                            // lineCoverageTargets: '80, 70, 50',
                            // methodCoverageTargets: '80, 70, 50',
                            sourceEncoding: 'ASCII'

                    publishHTML(target: [
                            allowMissing         : false,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : "${UNIT_RESULTS}/coverage/lcov-report",
                            reportFiles          : 'index.html',
                            reportName           :  "${PRODUCT_NAME} - Unit Test Coverage Report"
                    ])
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Test: System
         *
         * TIMEOUT
         * -------
         * 30 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.system_test is true
         *
         * ENVIRONMENT VARIABLES
         * ---------------------
         * JEST_JUNIT_OUTPUT:
         * Configures the jest junit reporter's output location.
         *
         * JEST_SUITE_NAME:
         * Configures the test suite name.
         *
         * JEST_JUNIT_ANCESTOR_SEPARATOR
         * Configures the separator used for nested describe blocks.
         *
         * JEST_JUNIT_CLASSNAME:
         * Configures how test class names are output.
         *
         * JEST_JUNIT_TITLE:
         * Configures the title of the tests.
         *
         * JEST_HTML_REPORTER_OUTPUT_PATH:
         * Configures the jest html reporter's output location.
         *
         * JEST_HTML_REPORTER_PAGE_TITLE:
         * Configures the jset html reporter's page title.
         *
         * TEST_SCRIPT:
         * A variable that contains the shell script that runs the integration
         * tests. So we don't have to type out a lot of text.
         *
         * DESCRIPTION
         * -----------
         * Executes the `npm run test:integration` command to perform
         * integration tests and captures the resulting html and junit outputs.
         *
         * OUTPUTS
         * -------
         * Jenkins: Integration Test Report (through junit plugin)
         * HTML: Integration Test Report
         ************************************************************************/
        stage('Test: System') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.system_test
                    }
                }
            }
            environment {
                JEST_JUNIT_OUTPUT = "${SYSTEM_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "System Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="System.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_HTML_REPORTER_OUTPUT_PATH = "${SYSTEM_RESULTS}/index.html"
                JEST_HTML_REPORTER_PAGE_TITLE = "${BRANCH_NAME} - System Test"
                JEST_STARE_RESULT_DIR = "${SYSTEM_RESULTS}/jest-stare"
                JEST_STARE_RESULT_HTML = "index.html"
                TEST_SCRIPT = "./jenkins/system_tests.sh"
                TEST_PROPERTIES_FILE = "./__tests__/__resources__/properties/custom_properties.yaml"
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    sh "mkdir -p ./__tests__/__resources__/properties"
                    sh "touch $TEST_PROPERTIES_FILE"
                
                    sh 'npm run test:system'

                    // Capture test report
                    junit JEST_JUNIT_OUTPUT
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Check for CD Skip
         *
         * TIMEOUT
         * -------
         * 2 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - Always
         *
         * DECRIPTION
         * ----------
         * Compare the version in package.json with released version. If the same,
         * the build is stopped. Needed because the pipeline does do some simple
         * merge on the master branch for documentation updates
         *
         * OUTPUTS
         * -------
         * PIPELINE_CONTROL.cd_skip will be set to 'true', 
         *  - if master branch's release version and new version are the same
         *  - if there isn't any new commit
         ************************************************************************/
        stage('Check for CD Skip') {
        when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.cd_skip == false
                    }
                    expression {
                        return RELEASE_BRANCHES.contains(BRANCH_NAME)
                    }
                }
            }
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        // Retrieve new version from package.json
                        def NEW_VERSION = sh (
                            script: 'echo "console.log(require(\'./package.json\').version);" | node',
                            returnStdout: true
                        ).trim()
                        echo "NEW_VERSION: ${NEW_VERSION}"
                        // Retrieve released version from npmjs.org
                        def RELEASED_VERSION = sh (
                            script: 'npm view "$(echo "console.log(require(\'./package.json\').name);" | node)" version --registry '+NPM_FULL_REGISTRY+' || true',
                            returnStdout: true
                        ).trim()
                        echo "RELEASED_VERSION: ${RELEASED_VERSION}"

                        // skip deploying, if version has not changed.
                        // However, we deploy dev branch even if version has not changed
                        // as long as there is any new commit
                        if (NEW_VERSION == RELEASED_VERSION && BRANCH_NAME != DEV_BRANCH) {
                            echo 'New version and released version are the same. Skip deploying.'
                            PIPELINE_CONTROL.cd_skip = true
                        }
                        if (GIT_COMMIT == GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                            echo 'There is no new commit. Skip deploying'
                            PIPELINE_CONTROL.cd_skip = true
                        }
                    }
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Deploy
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Deploys the current build as an npm package to an npm registry. The
         * build will be tagged as beta.
         *
         * OUTPUTS
         * -------
         * npm: A package to an npm registry
         ************************************************************************/
        stage('Deploy') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.cd_skip == false
                    }
                    expression {
                        return RELEASE_BRANCHES.contains(BRANCH_NAME)
                    }
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo 'Deploy Binary'
                    script {
                        sh "rm -f .npmrc"
                        // set @zowe registry
                        sh "echo always-auth=true >> .npmrc"
                        sh "echo @brightside:registry=https://api.bintray.com/npm/ca/brightside/ >> .npmrc"
                        sh "echo @brightside:always-auth=false >> .npmrc"
                        if (BRANCH_NAME == MASTER_BRANCH) {
                            // Set registry
                            sh "echo registry=$NPM_FULL_REGISTRY >> .npmrc"
                            // Set credential
                            sh "echo //$NPM_REGISTRY/:_authToken=${NPM_CREDENTIALS_PSW} >> .npmrc"
                            // deploy 
                            echo "publishing to $NPM_FULL_REGISTRY"
                            sh "npm publish --tag latest"
                        } else if (BRANCH_NAME == DEV_BRANCH) {
                            // Set version
                            def baseVersion = sh returnStdout: true, script: 'node -e "console.log(require(\'./package.json\').version.split(\'-\')[0])"'
                            def preReleaseVersion = baseVersion.trim() + "-next." + new Date().format("yyyyMMddHHmm", TimeZone.getTimeZone("UTC"))
                            sh "npm version ${preReleaseVersion} --no-git-tag-version"
                            // Set credential
                            withCredentials([usernamePassword(credentialsId: ARTIFACTORY_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'API_KEY')]) {
                                sh 'curl -u $USERNAME:$API_KEY https://eu.artifactory.swg-devops.com/artifactory/api/npm/auth/ >> .npmrc'
                            }
                            // Set registry
                            sh "echo registry=$TEST_NPM_REGISTRY >> .npmrc"
                            // deploy 
                            echo "publishing to $TEST_NPM_REGISTRY"
                            sh "npm publish --tag alpha"
                        } else {
                            echo "Only master and dev branch is allowed to deploy the app (current branch: $BRANCH_NAME). Skip deploying"
                        }
                    }
                }
            }
        }
    }

    // Slack notification when fails or back to normal
    post {
        unsuccessful {
            script {
                if (NOTIFY_BRANCHES.contains(BRANCH_NAME)) {
                    slackSend (channel: '#cics-node-dev', message: "${env.JOB_NAME} #${env.BUILD_NUMBER} completed - ${currentBuild.result} (<${env.BUILD_URL}|Open>)", tokenCredentialId: 'slack-cics-node-dev')
                }
            }
        }
        fixed {
            script {
                if (NOTIFY_BRANCHES.contains(BRANCH_NAME)) {
                    slackSend (channel: '#cics-node-dev', message: "${env.JOB_NAME} #${env.BUILD_NUMBER} completed - Back to normal (<${env.BUILD_URL}|Open>)", tokenCredentialId: 'slack-cics-node-dev')
                }
            }
        }
    }
}
