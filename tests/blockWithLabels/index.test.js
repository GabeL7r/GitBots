const blockWithLabels = require('../../blockWithLabels');
const pr = require('./pr.json');
const prWithBlockingLabel = require('./prWithBlockingLabel.json');

describe('blockWithlabels', () => {
    it('returns empty array if now blocking labels', () => {
		const json = jest.fn();
		const res = { status: function() {
			return {
				json
			}
		}};
    
		blockWithLabels(pr, res)
		expect(json).toBeCalledWith({blockingLabels: []})
    })
 
	it('returns array of blocking lables', () => {
		const json = jest.fn();
		const res = { status: function() {
			return {
				json
			}
		}};
    
		blockWithLabels(prWithBlockingLabel, res)
		expect(json).toBeCalledWith({blockingLabels: ['do not merge']})
    })

})
