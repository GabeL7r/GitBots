const blockWithLabels = require('./blockWithLabels.js');
   
const titleLint = require('./titleLint.js');
const cloud = require("@pulumi/cloud-aws");
let aws = require("@pulumi/aws");

const api = new cloud.API("github-apps");

api.post("/github/block-with-labels", blockWithLabels.handle)
api.post("/github/title-lint", titleLint.handle)

exports.endpointJs = api.publish().url;
