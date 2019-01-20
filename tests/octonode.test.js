const github = require('octonode')

describe('octonode', () => {
    it('creates pr client', async () => {
        const client = github.client()
        const ghpr = client.pr('CodeSherpas/gitmvp-test-staging', 37)
        const result = ghpr.createReview({event: 'APPROVE'}, (result) => {
            expect(typeof ghpr).toBe('object');
            console.log(result)
        
        })
        // console.log(result)

    })
})
