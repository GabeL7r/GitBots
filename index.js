const blockWithLabels = require('./blockWithLabels.js');
const cloud = require("@pulumi/cloud-aws");
let aws = require("@pulumi/aws");
const EventHandler = require("@octokit/webhooks/event-handler");
const App = require("@octokit/app");
const octokit = require("@octokit/rest")({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": "octokit/rest.js v1.2.3" // v1.2.3 will be current version
  }
});

const api = new cloud.API("github-apps");

api.post("/github/block-with-labels", blockWithLabels.handle)

exports.endpointJs = api.publish().url;
