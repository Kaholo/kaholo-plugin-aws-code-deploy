const parsers = require("./parsers");
const AWS = require("aws-sdk");
const {promisify} = require("util");

const codeDeployAsyncs = ["createApplication", "createDeploymentGroup", "createDeploymentConfig", "listApplications", "listDeploymentConfigs", "getDeploymentConfig"];

module.exports = class CodeDeployService{
    constructor({accessKeyId, secretAccessKey, region}){
        if (!accessKeyId || !secretAccessKey || !region) throw "Didn't provide access key or region!";
        const creds = {accessKeyId, secretAccessKey, region};
        this.codeDeploy = new AWS.CodeDeploy(creds);
        this.ec2 = new AWS.EC2(creds);
        this.iam = new AWS.IAM(creds);
        this.elb = new AWS.ELB(creds);
        this.elb2 = new AWS.ELBv2(creds);
        this.autoScaling = new AWS.AutoScaling(creds);
        this.aws = {
            describeRegions: promisify(this.ec2.describeRegions).bind(this.ec2),
            listRoles: promisify(this.iam.listRoles).bind(this.iam),
            describeAutoScalingGroups: promisify(this.autoScaling.describeAutoScalingGroups).bind(this.autoScaling),
            describeLoadBalancers: promisify(this.elb.describeLoadBalancers).bind(this.elb),
            describeTargetGroups: promisify(this.elb2.describeTargetGroups).bind(this.elb2)
        };
        for (const func of codeDeployAsyncs){
            this.aws[func] = promisify(this.codeDeploy[func]).bind(this.codeDeploy);
        }
    }

    static from(params, settings){
        return new CodeDeployService({
            accessKeyId: parsers.string(params.accessKeyId || settings.accessKeyId),
            secretAccessKey: params.secretAccessKey || settings.secretAccessKey,
            region: parsers.autocomplete(params.region || settings.region)
        });
    }
    
    async createApplication({name, computePlatform, tags}){
        if (!name || !computePlatform) throw "Must provide application name and compute platform type!";
        return this.aws.createApplication({
            applicationName: name,
            computePlatform, tags
        });
    }
    
    async createDeploymentGroup({application, name, serviceRole, deploymentType, copyAutoScalingGroup, 
                                autoScalingGroups, ec2TagFilters, onPremisesInstanceTagFilters , deploymentConfig, 
                                loadBalancingType, loadBalancer, elbTargetGroup}){
        if (!application || !name || !serviceRole || !deploymentType) throw "Didn't provide all required parameters."
        if (loadBalancingType === "Classic" && !loadBalancer) throw "Must provide a loadBalancer if specified 'Classic' load balancing.";
        if (loadBalancingType === "Application" && !elbTargetGroup) throw "Must provide an ELB target group if specified 'Application/Network' load balancing.";
        const params = {
            applicationName: application,
            deploymentGroupName: name,
            serviceRoleArn: serviceRole,
            autoScalingGroups: copyAutoScalingGroup ? [copyAutoScalingGroup] : autoScalingGroups,
            blueGreenDeploymentConfiguration: deploymentType === "BLUE_GREEN" ? {
                greenFleetProvisioningOption: copyAutoScalingGroup ? "COPY_AUTO_SCALING_GROUP" : "DISCOVER_EXISTING "
            } : undefined,
            deploymentConfigName: deploymentConfig,
            deploymentStyle: {
                deploymentOption: !loadBalancingType || loadBalancingType === "None" ? "WITHOUT_TRAFFIC_CONTROL" : "WITH_TRAFFIC_CONTROL",
                deploymentType
            },
            loadBalancerInfo: !loadBalancingType || loadBalancingType === "None" ? undefined : {
                elbInfoList: loadBalancingType === "Classic" && loadBalancer ? [{name: loadBalancer}] : undefined,
                targetGroupInfoList: loadBalancingType === "Application" && elbTargetGroup ? [{name: elbTargetGroup}] : undefined,
            },
            ec2TagFilters, onPremisesInstanceTagFilters
        };
        return this.aws.createDeploymentGroup(params);
    }
    
    async createDeploymentConfig({name, computePlatform, minHealthyHostsNum, minHealthyHostsPercent}){
        if (!computePlatform || !name || !(minHealthyHostsNum || minHealthyHostsPercent)) throw "Didn't provide all required parameters.";
        if (minHealthyHostsPercent && minHealthyHostsNum) throw "Can't provide both minimum by number and by percentage.";
        return this.aws.createDeploymentConfig({
            deploymentConfigName: name,
            minimumHealthyHosts: {
                type: minHealthyHostsNum ? "HOST_COUNT" : "FLEET_PERCENT",
                value: minHealthyHostsNum || minHealthyHostsPercent
            },
            computePlatform
        });
    }
    
    async listRegions(){
        return this.aws.describeRegions({});
    }

    async listAll(funcName, outputName, params = {}){
        try {
            var result = await this.aws[funcName](params);
            const items = [result[outputName]];
            while (result.nextToken){
                params.nextToken = result.nextToken;
                result = await this.aws[funcName](params);
                items.push(...result[outputName]);
            }
        }
        catch (error){
            throw `Problem with listing '${outputName}' using '${funcName}': ${error.message || JSON.stringify(error)}`;
        }
        return items;
    }
    
    async listApps({nextToken, listAll}){
        if (listAll) return this.listAll("listApplications", "applications");
        return this.aws.listApplications({nextToken});
    }
    
    async listRoles({nextToken}){
        return this.aws.listRoles({Marker: nextToken});
    }
    
    async listAutoScalingGroups({nextToken}){
        return this.aws.describeAutoScalingGroups({NextToken: nextToken});
    }
    
    async listDeploymentsConfigs({computePlatform, nextToken, listAll}){
        const validateComputePlatform = computePlatform ? (deploymentConfigName) => this.aws.getDeploymentConfig({deploymentConfigName}).computePlatform === computePlatform : undefined;
        if (listAll){
            const result = await this.listAll("listDeploymentConfigs", "deploymentConfigsList");
            return computePlatform ? result.filter(validateComputePlatform) : result;
        }
        const result = await this.aws.listDeploymentConfigs({nextToken});
        if (computePlatform){
            result.deploymentConfigsList = result.deploymentConfigsList.filter(validateComputePlatform);
        }
        return result;
    }
    
    async listLoadBalancers({nextToken}){
        return this.aws.describeLoadBalancers({Marker: nextToken});
    }
    
    async listElbTargetGroups({nextToken}){
        return this.aws.describeTargetGroups({Marker: nextToken});
    }
}