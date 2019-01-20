const App = require('@octokit/app')
const github = require('octonode');

class PullRequestApp {
    constructor(body, appId, privateKey) {
        this.body = body
        this.owner = body.repository.owner.login
        this.repo = body.repository.name
        this.number = body.pull_request.number
        this.installationId = body.installation.id

        this.githubApp = new App({id: appId, privateKey})
    }

    async createClient() {
        this.token = await this.githubApp.getInstallationAccessToken({installationId: this.installationId})
        this.client = github.client(this.token)
    }

    async createReview({pass, approveMsg, rejectMsg}) {
        let event = pass ? 'APPROVE' : 'REQUEST_CHANGES'
        let body = pass ? approveMsg : rejectMsg

        return await this.client.pr(`${this.owner}/${this.repo}`, this.number).createReviewAsync({event, body})
        
    }
}


module.exports = { PullRequestApp }
