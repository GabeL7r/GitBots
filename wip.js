const { getBlockingLabels } = require('./blockWithLabels.js')
module.exports = { handle }

async function handle(req, res) {
    try{
        const regex = new RegExp(/^wip/)
     
        const titlePass = !regex.test(req.body.pull_request.title)
        const labelsPass = !getBlockingLabels(req.body.pull_request.labels, ['wip']).length

        console.log('Title Pass: ', titlePass)
        console.log('Label Pass: ', labelsPass)
        const pass = titlePass && labelsPass

        await req.createStatus({pass, context: 'Work In Process'})

        return res.status(200).json({message: 'Created review on PR'})
    }catch(e) {
        console.log(e)
        return res.status(500).json(e)
    }
}
