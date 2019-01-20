let pulumi = require("@pulumi/pulumi");
let config = new pulumi.Config("pulumi-github-apps");

module.exports = {
    blockWithLabels: config.require("blockWithLabels"),
};
