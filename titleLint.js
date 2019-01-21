module.exports = { handle }

async function handle(req, res) {
    console.log('Getting config...')
    const config = await req.getConfig();
    console.log('Config is:', config)

    try{
        const regex = new RegExp(config.regex || '.*')
     
        const pass = regex.test(req.body.pull_request.title)
        const rejectMsg = `Title doesn't match regex: ${regex}`

        await req.createReview({pass, rejectMsg})

        return res.status(200).json({message: 'Created review on PR'})
    }catch(e) {
        console.log(e)
        return res.status(500).json(e)
    }
}
