const App = require('@octokit/app')
const octokit = require('@octokit/rest')({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: 'application/vnd.github.v3+json',
   'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
  },
})

const EventHandler = require('@octokit/webhooks/event-handler');

const repo = 'gitmvp-prod-staging';
const owner = 'CodeSherpas';
const installationId = 324996;


const APP_ID = 17027 // replace with your app ID
const PRIVATE_KEY = null;


describe('@octokit', () => {
    const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY })
    let jwt;
    
    beforeAll( async () => {
        jwt = await app.getSignedJsonWebToken()
    })

    describe('app', () => {
        it('creates a signed jwt', async () => {
            expect(typeof jwt).toBe('string')
        })

   
    })

    describe('rest', () => {
        it('authenticates as app', async () => {
            const installationAccessToken = await app.getInstallationAccessToken({ installationId })
            expect(typeof installationAccessToken).toBe('string')

         })
 
        it('creates authenticated request', async () => {
            octokit.authenticate({
                type: 'app',
                token: jwt

            })
            const { data } = await octokit.apps.findRepoInstallation({owner, repo})
            expect(data.id).toBe(324996)
        })
    })

    describe('webhooks', () => {
        describe('event-handler', async () => {
            const request = require('./mocks/pr.json');

            const eventHandler = new EventHandler({
                async transform (event) {
                    // optionally transform passed event before handlers are called
                    return event
                }
            })
            
            const process = jest.fn().mockResolvedValue(true)
            // const process = function() { console.log('here') }
            const error = jest.fn().mockResolvedValue(true)
            eventHandler.on('pull_request.opened', process)

                    // put this inside your webhooks route handler
            eventHandler.receive({
                id: request.headers['X-GitHub-Delivery'],
                name: request.headers['X-GitHub-Event'],
                payload: request.body
            })
            .catch(error)
            .then( () => {
                expect(process).toHaveBeenCalledTimes(1)
                expect(error).not.toHaveBeenCalled()
            })
        })
    })
})


// Example of using authenticated app to GET an individual installation
// https://developer.github.com/v3/apps/#find-repository-installation
// contains the installation id necessary to authenticate as an installation
// const installationId = body.data.id
