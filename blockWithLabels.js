module.exports = { handle }

async function handle(req, res) {
    console.log('Getting config...')
    const config = await req.getConfig();
    console.log('Config is:', config)



    const labels = req.body.pull_request.labels;

    console.log('Labels: ', labels);

    const blockingLabels = getBlockingLabels(labels, config.blocking);
    console.log('Blocking Labels: ', blockingLabels);

    const pass = !blockingLabels.length;

    const rejectMsg = `Remove labels: ${blockingLabels.join(',')}`
    try {
        await req.createReview({ pass, rejectMsg })
        return res.status(200).json({message: 'Created review on PR'})
    } catch (e) {
        console.log(e)
        return res.status(500).json(e)
    }
}

function getBlockingLabels(labels, blockingLabels) {
    if (!blockingLabels || blockingLabels.length === 0 || labels.length === 0) {
        return [];
    }

    const regex = new RegExp(blockingLabels.join('|'), 'ig');

    return labels.map(l => (regex.test(l.name) ? l.name : null)).filter(e => e);
}
