/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

// The following property need to be set for the HTML report @TODO figure out how to get this nicely on jenkins
//System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")

/**
 * Release branches
 */
def RELEASE_BRANCHES = ["master"]

/**
 * The following flags are switches to control which stages of the pipeline to be run.  This is helpful when 
 * testing a specific stage of the pipeline.
 */
def PIPELINE_CONTROL = [
    build: true,
    unit_test: true,
    integration_test: false,
    system_test: true,
    deploy: false,
    smoke_test: false,
    create_bundle: false,
    ci_skip: false ]

/**
 * The result strings for a build status
 */
def BUILD_RESULT = [
    success: 'SUCCESS',
    unstable: 'UNSTABLE',
    failure: 'FAILURE'
]

/**
 * Test npm registry using for smoke test
 */
def TEST_NPM_REGISTRY = "http://imperative-npm-registry.ca.com"

/**
 * The root results folder for items configurable by environmental variables
 */
def TEST_RESULTS_FOLDER = "__tests__/__results__" 

/**
 * The location of the unit test results
 */
def UNIT_RESULTS = "${TEST_RESULTS_FOLDER}/unit"

/**
 * The location of the integration test results
 */
def INTEGRATION_RESULTS = "${TEST_RESULTS_FOLDER}/integration"


/**
 * The location of the system test results
 */
 def SYSTEM_RESULTS = "${TEST_RESULTS_FOLDER}/system"

/**
 * The name of the master branch
 */
def MASTER_BRANCH = "master"

/**
 * List of people who will get all emails for master builds
 */
def MASTER_RECIPIENTS_LIST = "cc:SomeBody@ca.com"

/**
 * A command to be run that gets the current revision pulled down
 */
def GIT_REVISION_LOOKUP = 'git log -n 1 --pretty=format:%h'

/**
 * The credentials id field for the artifactory username and password
 */
def ARTIFACTORY_CREDENTIALS_ID = 'GizaArtifactory'

/**
 * The email address for the artifactory
 */
def ARTIFACTORY_EMAIL = 'giza.jenkins@gmail.com'

/**
 * This is the product name used by the build machine to store information about
 * the builds
 */
def PRODUCT_NAME = "zowe-cli-cics-deploy-plugin"

/**
 * This is where the Zowe project needs to be installed
 */
def ZOWE_CLI_INSTALL_DIR = "/.npm-global/lib/node_modules/@brightside/core"

// Setup conditional build options. Would have done this in the options of the declarative pipeline, but it is pretty
// much impossible to have conditional options based on the branch :/
def opts = []

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

    environment {
        // Environment variable for flow control. Indicates if the git source was updated by the pipeline.
        GIT_SOURCE_UPDATED = "false"

        // Tell npm to install global packages within the workspace dir, and add it 
        // to PATH. This allows us to do a global install for Zowe without affect
        // other Jenkins jobs or needing root access.
        NPM_CONFIG_PREFIX = "${WORKSPACE}/npm-global"
        PATH = "${NPM_CONFIG_PREFIX}/bin:${PATH}"
    }

    stages {
        /************************************************************************
         * STAGE
         * -----
         * Check for CI Skip
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
         * Checks for the [ci skip] text in the last commit. If it is present,
         * the build is stopped. Needed because the pipeline does do some simple
         * git commits on the master branch for the purposes of version bumping.
         *
         * OUTPUTS
         * -------
         * PIPELINE_CONTROL.ci_skip will be set to 'true' if [ci skip] is found in the
         * commit text.
         ************************************************************************/
        stage('Check for CI Skip') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        // We need to keep track of the current commit revision. This is to prevent the condition where
                        // the build starts on master and another branch gets merged to master prior to version bump
                        // commit taking place. If left unhandled, the version bump could be done on latest master branch
                        // code which would already be ahead of this build.
                        BUILD_REVISION = sh returnStdout: true, script: GIT_REVISION_LOOKUP

                        // This checks for the [ci skip] text. If found, the status code is 0
                        def result = sh returnStatus: true, script: 'git log -1 | grep \'.*\\[ci skip\\].*\''
                        if (result == 0) {
                            echo '"ci skip" spotted in the git commit. Aborting.'
                            PIPELINE_CONTROL.ci_skip = true
                        }
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
         * - PIPELINE_CONTROL.ci_skip is false
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
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build || PIPELINE_CONTROL.smoke_test
                    }
                }
            }
            steps('Install Zowe CLI') {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Install Zowe CLI globaly"
                    sh("npm set @brightside:registry https://api.bintray.com/npm/ca/brightside/")
                    sh("npm install -g @brightside/core@next")
                    sh("zowe --version")
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
         * - PIPELINE_CONTROL.ci_skip is false
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
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.build
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo 'Installing Dependencies'

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
         * - PIPELINE_CONTROL.ci_skip is false
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
                        return PIPELINE_CONTROL.ci_skip == false
                    }
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
         * - PIPELINE_CONTROL.ci_skip is false
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
                        return PIPELINE_CONTROL.ci_skip == false
                    }
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

                    // cobertura autoUpdateHealth: false,
                    //         autoUpdateStability: false,
                    //         coberturaReportFile: "${UNIT_RESULTS}/coverage/cobertura-coverage.xml",
                    //         failUnhealthy: false,
                    //         failUnstable: false,
                    //         onlyStable: false,
                    //         zoomCoverageChart: false,
                    //         maxNumberOfBuilds: 20,
                    //         // classCoverageTargets: '85, 80, 75',
                    //         // conditionalCoverageTargets: '70, 65, 60',
                    //         // lineCoverageTargets: '80, 70, 50',
                    //         // methodCoverageTargets: '80, 70, 50',
                    //         sourceEncoding: 'ASCII'

                    // publishHTML(target: [
                    //         allowMissing         : false,
                    //         alwaysLinkToLastBuild: true,
                    //         keepAll              : true,
                    //         reportDir            : "${UNIT_RESULTS}/coverage/lcov-report",
                    //         reportFiles          : 'index.html',
                    //         reportName           :  "${PRODUCT_NAME} - Unit Test Coverage Report"
                    // ])
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Test: Integration
         *
         * TIMEOUT
         * -------
         * 30 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.integration_test is true
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
        stage('Test: Integration') {
            when {
                allOf {
                    expression {
                        return PIPELINE_CONTROL.ci_skip == false
                    }
                    expression {
                        return PIPELINE_CONTROL.integration_test
                    }
                }   
            }
            environment {
                JEST_JUNIT_OUTPUT = "${INTEGRATION_RESULTS}/junit.xml"
                JEST_SUITE_NAME = "Integration Tests"
                JEST_JUNIT_ANCESTOR_SEPARATOR = " > "
                JEST_JUNIT_CLASSNAME="Integration.{classname}"
                JEST_JUNIT_TITLE="{title}"
                JEST_HTML_REPORTER_OUTPUT_PATH = "${INTEGRATION_RESULTS}/index.html"
                JEST_HTML_REPORTER_PAGE_TITLE = "${BRANCH_NAME} - Integration Test"
                TEST_SCRIPT = "./jenkins/integration_tests.sh"
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    echo 'Integration Test'

                    echo 'Perform integration test here'
                    echo 'Record test reports artifacts'

                    // sh "chmod +x $TEST_SCRIPT && dbus-launch $TEST_SCRIPT"

                    // junit JEST_JUNIT_OUTPUT

                    // // Publish HTML report
                    // publishHTML(target: [
                    //         allowMissing         : false,
                    //         alwaysLinkToLastBuild: true,
                    //         keepAll              : true,
                    //         reportDir            : INTEGRATION_RESULTS,
                    //         reportFiles          : 'index.html',
                    //         reportName           : 'Imperative - Integration Test Report'
                    // ])
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
         * - PIPELINE_CONTROL.ci_skip is false
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
                        return PIPELINE_CONTROL.ci_skip == false
                    }
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
                    touch "${TEST_PROPERTIES_FILE}"
                
                    sh 'npm run test:system'

                    // Capture test report
                    junit JEST_JUNIT_OUTPUT
                }
            }
        }

        /************************************************************************
         * STAGE
         * -----
         * Bump Version
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.deploy is true
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Bumps the pre-release version in preparation for publishing to an npm
         * registry. It will clean out any pending changes and switch to the real
         * branch that was published (currently the pipeline would be in a
         * detached HEAD at the commit) before executing the npm command to bump
         * the version.
         *
         * The step does checking against the commit that was checked out and
         * the BUILD_REVISION that was retrieved earlier. If they do not match,
         * the commit will not be pushed and the build will fail. This handles
         * the condition where the current build made it to this step but another
         * change had been pushed to the master branch. This means that we would
         * have to bump the version of a future commit to the one we just built
         * and tested, which is a big no no. A corresponding email will be sent
         * out in this situation to explain how this condition could have occurred.
         *
         * OUTPUTS
         * -------
         * GitHub: A commit containing the bumped version in the package.json.
         *
         *         Commit Message:
         *         Bumped pre-release version <VERSION_HERE> [ci skip]
         ************************************************************************/
        // stage('Bump Version') {
        //     when {
        //         allOf {
        //             expression {
        //                 return PIPELINE_CONTROL.ci_skip == false
        //             }
        //             expression {
        //                 return PIPELINE_CONTROL.deploy
        //             }
        //             expression {
        //                 return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
        //             }
        //         }
        //     }
        //     steps {
        //         timeout(time: 5, unit: 'MINUTES') {
        //             echo "Bumping Version"

        //             echo 'Perform version bump for the branch'
        //         }
        //     }
        // }
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
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.deploy is true
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
        // stage('Deploy') {
        //     when {
        //         allOf {
        //             expression {
        //                 return PIPELINE_CONTROL.ci_skip == false
        //             }
        //             expression {
        //                 return PIPELINE_CONTROL.deploy
        //             }
        //             expression {
        //                 return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
        //             }
        //         }
        //     }
        //     steps {
        //         timeout(time: 5, unit: 'MINUTES') {
        //             echo 'Deploy Binary'

        //             echo 'Perform binary deployment'
        //         }
        //     }
        // }
        /************************************************************************
         * STAGE
         * -----
         * Smoke Test
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.smoke_test is true
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Install the new pulished plugin and run some simple command to validate 
         *
         ************************************************************************/
        // stage('Smoke Test') {
        //     when {
        //         allOf {
        //             expression {
        //                 return PIPELINE_CONTROL.ci_skip == false
        //             }
        //             expression {
        //                 return PIPELINE_CONTROL.smoke_test
        //             }
        //             expression {
        //                 return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
        //             }
        //         }
        //     }
        //     steps {
        //         timeout(time: 5, unit: 'MINUTES') {
        //             echo "Smoke Test"

        //             echo 'Perform smoke test here'
        //             echo 'Record test reports artifacts'
        //         }
        //     }
        // }
        /************************************************************************
         * STAGE
         * -----
         * Create Bundle
         *
         * TIMEOUT
         * -------
         * 5 Minutes
         *
         * EXECUTION CONDITIONS
         * --------------------
         * - PIPELINE_CONTROL.ci_skip is false
         * - PIPELINE_CONTROL.create_bundle is true
         * - The current branch part of RELEASE_BRANCHES
         * - The build is still successful and not unstable
         *
         * DESCRIPTION
         * -----------
         * Creates a self-contained tgz archive so that the package can be
         * installed offline. It does this by calling a node script in
         * ./jenkins/configure-to-bundle.js which creates the needed
         * bundledDependencies property within the package.json of the project.
         *
         * After the package.json is updated, we run the `npm pack` command and
         * archive it under the name generated by the JS file.
         *
         * OUTPUTS
         * -------
         * ${package_name}-${package_version}-bundled.tgz:
         *
         * A self-contained npm package install file.
         ************************************************************************/
        // stage('Create Bundle') {
        //     when {
        //         allOf {
        //             expression {
        //                 return PIPELINE_CONTROL.ci_skip == false
        //             }
        //             expression {
        //                 return PIPELINE_CONTROL.create_bundle
        //             }
        //             expression {
        //                 return currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success)
        //             }
        //             expression {
        //                 return RELEASE_BRANCHES.contains(BRANCH_NAME)
        //             }
        //         }
        //     }
        //     steps {
        //         timeout(time: 5, unit: 'MINUTES') {
        //             echo 'Archiving bundled binary file'
        //             echo 'Perform package bundle task'
        //         }
        //     }
        // }
    }
    // post {
    //     /************************************************************************
    //      * POST BUILD ACTION
    //      *
    //      * Sends out emails and logs out of the registry
    //      *
    //      * Emails are only sent out when PIPELINE_CONTROL.ci_skip is false.
    //      *
    //      * Sends out emails when any of the following are true:
    //      *
    //      * - It is the first build for a new branch
    //      * - The build is successful but the previous build was not
    //      * - The build failed or is unstable
    //      * - The build is on the MASTER_BRANCH
    //      *
    //      * In the case that an email was sent out, it will send it to individuals
    //      * who were involved with the build and if broken those involved in
    //      * breaking the build. If this build is for the MASTER_BRANCH, then an
    //      * additional set of individuals will also get an email that the build
    //      * occurred.
    //      ************************************************************************/
    //     always {
    //         script {
    //             def buildStatus = currentBuild.currentResult

    //             if (PIPELINE_CONTROL.ci_skip == false) {
    //                 try {
    //                     def previousBuild = currentBuild.getPreviousBuild()
    //                     def recipients = ""

    //                     def subject = "${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
    //                     def consoleOutput = """
    //                     <p>Branch: <b>${BRANCH_NAME}</b></p>
    //                     <p>Check console output at "<a href="${RUN_DISPLAY_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>
    //                     """

    //                     def details = ""

    //                     if (previousBuild == null) {
    //                         details = "<p>Initial build for new branch.</p>"
    //                     } else if (currentBuild.resultIsBetterOrEqualTo(BUILD_RESULT.success) && previousBuild.resultIsWorseOrEqualTo(BUILD_RESULT.unstable)) {
    //                         details = "<p>Build returned to normal.</p>"
    //                     }

    //                     // Issue #53 - Previously if the first build for a branch failed, logs would not be captured.
    //                     //             Now they do!
    //                     if (currentBuild.resultIsWorseOrEqualTo(BUILD_RESULT.unstable)) {
    //                         // Archives any test artifacts for logging and debugging purposes
    //                         archiveArtifacts allowEmptyArchive: true, artifacts: '__tests__/__results__/**/*.log'
    //                         details = "${details}<p>Build Failure.</p>"
    //                     }

    //                     if (BRANCH_NAME == MASTER_BRANCH) {
    //                         recipients = MASTER_RECIPIENTS_LIST

    //                         details = "${details}<p>A build of master has finished.</p>"

    //                         if (GIT_SOURCE_UPDATED == "true") {
    //                             details = "${details}<p>The pipeline was able to automatically bump the pre-release version in git</p>"
    //                         } else {
    //                             // Most likely another PR was merged to master before we could do the commit thus we can't
    //                             // have the pipeline automatically do it
    //                             details = """${details}<p>The pipeline was unable to automatically bump the pre-release version in git.
    //                             <b>THIS IS LIKELY NOT AN ISSUE WITH THE BUILD</b> as all the tests have to pass to get to this point.<br/><br/>

    //                             <b>Possible causes of this error:</b>
    //                             <ul>
    //                                 <li>A commit was made to <b>${MASTER_BRANCH}</b> during the current run.</li>
    //                                 <li>The user account tied to the build is no longer valid.</li>
    //                                 <li>The remote server is experiencing issues.</li>
    //                             </ul>

    //                             <i>THIS BUILD WILL BE MARKED AS A FAILURE AS WE CANNOT GUARENTEE THAT THE PROBLEM DOES NOT LIE IN THE
    //                             BUILD AND CORRECTIVE ACTION MAY NEED TO TAKE PLACE.</i>
    //                             </p>"""
    //                         }
    //                     }

    //                     if (details != "") {
    //                         echo "Sending out email with details"
    //                         emailext(
    //                                 subject: subject,
    //                                 to: recipients,
    //                                 body: "${details} ${consoleOutput}",
    //                                 recipientProviders: [[$class: 'DevelopersRecipientProvider'],
    //                                                      [$class: 'UpstreamComitterRecipientProvider'],
    //                                                      [$class: 'CulpritsRecipientProvider'],
    //                                                      [$class: 'RequesterRecipientProvider']]
    //                         )
    //                     }
    //                 } catch (e) {
    //                     echo "Experienced an error sending an email for a ${buildStatus} build"
    //                     currentBuild.result = buildStatus
    //                 }
    //            }
    //        }
    //    }
    //}
}
