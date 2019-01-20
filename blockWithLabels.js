const EventHandler = require('@octokit/webhooks/event-handler');
const verify = require('@octokit/webhooks/verify')
const App = require('@octokit/app')
const github = require('octonode');
const config = require('./config.js');
const { PullRequestApp } = require('./PullRequestApp.js');


const APP_ID = 23917
const privateKey = require('./.env.js').blockWithLabelsPem

module.exports = { handle }

async function handle(req, res) {
	const body = JSON.parse(req.body.toString('utf-8'))

    try {
        validate(body, req.headers, 'blockWithLabels')
    } catch(e) {
        console.error(e)
        return res.status(401).json({message: 'Not authorized to make this request'});
    }
 
    const labels = body.pull_request.labels;

    console.log('Labels: ', labels);

    const blockingLabels = getBlockingLabels(labels, ['wip', 'do not merge']);
    console.log('Blocking Labels: ', blockingLabels);

    const pass = !blockingLabels.length;

    const rejectMsg = `Remove labels: ${blockingLabels.join(',')}`

    const pullRequestApp = new PullRequestApp(body, APP_ID, privateKey)

    try {
        console.log('Creating pull request client...')
        await pullRequestApp.createClient()

        console.log('Creating review on PR...')
        const result = await pullRequestApp.createReview({ pass, rejectMsg })

        console.log('PR result: ', result)
        console.log('Returning 200 status...')
        return res.status(200).json({message: 'Created review on PR'})
    } catch (e) {
        console.log(e)
        return res.status(500).json(e)
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
