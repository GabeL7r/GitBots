const EventHandler = require('@octokit/webhooks/event-handler');
const verify = require('@octokit/webhooks/verify')
const App = require('@octokit/app')
const github = require('octonode');
const config = require('./config.js');


const APP_ID = 23944
const privateKey = require('./.env.js').titleLintPem

module.exports = { handle }

async function handle(req, res) {
	const body = JSON.parse(req.body.toString('utf-8'))

    try {
        validate(body, req.headers, 'titleLint')
    } catch(e) {
        console.error(e)
        return res.status(401).json({message: 'Not authorized to make this request'});
    }

    try{
        const regex = new RegExp('(feat|fix|docs|chore|style|refactor|perf|test): .*')
     
        const pass = regex.test(body.pull_request.title)

        const app = new App({id:  APP_ID, privateKey})
        const token = await app.getInstallationAccessToken({installationId: body.installation.id})

        const client = github.client(token)

        const owner = body.repository.owner.login
        const repo = body.repository.name
        const number = body.pull_request.number

        const ghpr = client.pr(`${owner}/${repo}`, number)

        let event, prBody;
        if(pass) {
            event = 'APPROVE'
        } else {
            event = 'REQUEST_CHANGES'
            prBody = `Title doesn't match regex: ${regex}`
            
        }

        const result = await ghpr.createReviewAsync({event, body: prBody})

        return res.status(200)
    }catch(e) {
        console.log(e)
    
    }
}

function validate(body, headers, appName) {
  const secret = config[appName];
  
  if (!secret) throw new Error("Secret not found for application");

  if (!verify(secret, body, headers["x-hub-signature"])) {
    throw new Error("Signature does not match event payload and secert");
  }
}

function getBlockingLabels(labels, blockingLabels) {
    if (!blockingLabels || blockingLabels.length === 0 || labels.length === 0) {
        return [];
    }

    const regex = new RegExp(blockingLabels.join('|'), 'ig');

    return labels.map(l => (regex.test(l.name) ? l.name : null)).filter(e => e);
}
