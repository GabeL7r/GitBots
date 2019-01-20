let pulumi = require("@pulumi/pulumi");
let config = new pulumi.Config();

module.exports = {
    blockWithLabels: config.require("blockWithLabels"),
};
