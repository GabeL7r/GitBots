const App = require('@octokit/app')
const verify = require('@octokit/webhooks/verify')
const blockWithLabels = require('./blockWithLabels.js');
const titleLint = require('./titleLint.js');
const cloud = require("@pulumi/cloud-aws");
let aws = require("@pulumi/aws");
const config = require('./config.js');
const github = require('octonode');

const api = new cloud.API("github-apps");

api.post("/github/block-with-labels", enrich('blockWithLabels'))
api.post("/github/title-lint", enrich('titleLint'))

function enrich(appName) {
    return async function(req, res) {
        req.body = JSON.parse(req.body.toString('utf-8'))
        
        try {
            validate(req.body, req.headers, appName)
        } catch(e) {
            return res.status(401).json({message: 'Not authorized to make this request'});
        }

        try {
            console.log('Creating github client...')
            const githubApp = new App({id: config[appName].appId, privateKey: config[appName].privateKey })

            const token = await githubApp.getInstallationAccessToken({installationId: req.body.installation.id})
            req.client = github.client(token)
        } catch(e) {
            console.log(e)
            return res.status(500).json({message: 'Error creating github client'})
        }

        req.createReview = async function({pass, approveMsg, rejectMsg}) {
            let event = pass ? 'APPROVE' : 'REQUEST_CHANGES'
            let body = pass ? approveMsg : rejectMsg

            const owner = this.body.repository.owner.login;
            const repo = this.body.repository.name;
            const number = this.body.pull_request.number


            return await this.client.pr(`${owner}/${repo}`, number).createReviewAsync({event, body})
        }

        switch(appName) {
            case 'titleLint':
                console.log('Calling title lint...')
                return await titleLint.handle(req, res)
            case 'blockWithLabels':
                console.log('Calling block with labels...')
                return await blockWithLabels.handle(req,res)
            default:
                return res.send(500).json({message: `Could not find app: ${appName}`})
        }
    }
}

function validate(body, headers, appName) {
  const { secret } = config[appName];
  
  if (!secret) throw new Error("Secret not found for application");

  if (!verify(secret, body, headers["x-hub-signature"])) {
    throw new Error("Signature does not match event payload and secert");
  }
}


exports.endpointJs = api.publish().url;
