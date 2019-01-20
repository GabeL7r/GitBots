const EventHandler = require('@octokit/webhooks/event-handler');
const verify = require('@octokit/webhooks/verify')
const App = require('@octokit/app')
const github = require('octonode');


const APP_ID = 23917
const privateKey = require('./.env.js').blockWithLabelsPem

module.exports = { handle }

async function handle(req, res) {
	const body = JSON.parse(req.body.toString('utf-8'))
    const labels = body.pull_request.labels;

    console.log('Labels: ', labels);

    const blockingLabels = getBlockingLabels(labels, ['wip', 'do not merge']);
    console.log('Blocking Labels: ', blockingLabels);

    const pass = !blockingLabels.length;

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
        prBody = `Remove labels: ${blockingLabels.join(',')}`
        
    }

    const result = ghpr.createReview({event, body: prBody}, (err, res) => {
        if (err) {
            return res.status(500).json({err})
        }
        
        return res.status(200)
    
    })

    // try {
    //     validate(req, 'checkMyPR')
    // } catch(e) {
    //     console.error(e)
    //     return res.status(401).json({message: 'Not authorized to make this request'});
    // }
    
    // return res.status(200).json({token: config.blockWithLabels});
    // // const eventHandler = new EventHandler({
    //     async transform (event) {
    //         // optionally transform passed event before handlers are called
    //         return event
    //     }
    // })

    // eventHandler.receive({
    //     id: req.headers['X-GitHub-Delivery'],
    //     name: req.headers['X-GitHub-Event'],
    //     payload: req.body
    // })
}

function getOctokit(token) {
    octokit.auth({type: 'token', token})
}

function validate(req, appName) {
  const secret = config[appName];
  
  if (!secret) throw new Error("Secret not found for application");

  if (!verify(secret, req.body, req.headers["x-hub-signature"])) {
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
