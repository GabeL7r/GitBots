let pulumi = require("@pulumi/pulumi");
let config = new pulumi.Config();
let env = require('./.env.js');

module.exports = {
    titleLint: {
        appId: 23944,
        privateKey: env.titleLint,
        secret: config.require('titleLint')
    },
    blockWithLabels: {
        appId: 23917,
        privateKey: env.blockWithLabels,
        secret: config.require("blockWithLabels"),
    },
    wip: {
        appId:24257,
        privateKey: env.wip,
        secret: config.require("wip")
    
    }
};
