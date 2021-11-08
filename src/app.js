const parsers = require("./parsers");

const CodeDeployService = require('./aws.codeDeploy.service');

async function createApplication(action, settings){
    const {name, tags } = action.params;
    const client = CodeDeployService.from(action.params, settings);
    return client.createApplication({
        name: parsers.string(name),
        tags: parsers.tags(tags)
    });
}

async function createDeploymentGroup(action, settings){
    const { name, ec2TagFilters, onPremisesInstanceTagFilters, loadBalancingType, application,
        serviceRole, autoScalingGroups, deploymentConfig, loadBalancer, elbTargetGroup} = action.params;
    
    const client = CodeDeployService.from(action.params, settings);
    return client.createDeploymentGroup({
        application: parsers.autocomplete(application),
        name: parsers.string(name),
        serviceRole: parsers.autocomplete(serviceRole),
        autoScalingGroups: parsers.array(parsers.autocomplete(autoScalingGroups)),
        ec2TagFilters: parsers.tags(ec2TagFilters),
        onPremisesInstanceTagFilters : parsers.tags(onPremisesInstanceTagFilters),
        deploymentConfig: parsers.autocomplete(deploymentConfig),
        loadBalancingType: loadBalancingType,
        loadBalancer: parsers.autocomplete(loadBalancer),
        elbTargetGroup: parsers.autocomplete(elbTargetGroup)
    });
}

async function createDeploymentConfig(action, settings){
    const { name, minHealthyHostsNum, minHealthyHostsPercent } = action.params;
    
    const client = CodeDeployService.from(action.params, settings);
    return client.createDeploymentConfig({
        name: parsers.string(name),
        minHealthyHostsNum: parsers.number(minHealthyHostsNum),
        minHealthyHostsPercent: parsers.number(minHealthyHostsPercent)
    });
} 

async function listApps(action, settings){
    const client = CodeDeployService.from(action.params, settings);
    return client.listApps({listAll: true});
} 

async function listDeploymentsConfigs(action, settings){
    const client = CodeDeployService.from(action.params, settings);
    return client.listApps({listAll: true,});
} 

module.exports = {
    createApplication,
	createDeploymentGroup,
	createDeploymentConfig,
    listApps,
    listDeploymentsConfigs,
    // Autocomplete Functions
    ...require("./autocomplete")
}