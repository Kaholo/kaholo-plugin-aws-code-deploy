const { parseAwsTags } = require("./helpers");

function prepareCreateApplicationPayload(params) {
  return {
    applicationName: params.name,
    computePlatform: "Server",
    tags: params.tags,
  };
}

function prepareCreateDeploymentGroupPayload({
  application,
  name,
  serviceRole,
  autoScalingGroups,
  ec2TagFilters,
  onPremisesInstanceTagFilters,
  deploymentConfig,
  loadBalancingType,
  loadBalancer,
  elbTargetGroup,
}) {
  if (loadBalancingType === "Classic" && !loadBalancer) {
    throw new Error("Must provide a Load Balancer if specified 'Classic' load balancing.");
  }
  if (loadBalancingType === "Application" && !elbTargetGroup) {
    throw new Error("Must provide an ELB target group if specified 'Application/Network' load balancing.");
  }

  const addTagType = (tag) => ({ ...tag, Type: tag.Value ? "KEY_AND_VALUE" : "KEY_ONLY" });
  const parsedEc2TagFilters = parseAwsTags(ec2TagFilters).map(addTagType);
  const parsedInstanceTagFilters = parseAwsTags(onPremisesInstanceTagFilters).map(addTagType);

  return {
    applicationName: application,
    deploymentGroupName: name,
    serviceRoleArn: serviceRole,
    deploymentConfigName: deploymentConfig,
    deploymentStyle: {
      deploymentOption: !loadBalancingType || loadBalancingType === "None" ? "WITHOUT_TRAFFIC_CONTROL" : "WITH_TRAFFIC_CONTROL",
      deploymentType: "IN_PLACE",
    },
    loadBalancerInfo: !loadBalancingType || loadBalancingType === "None" ? undefined : {
      elbInfoList: loadBalancingType === "Classic" && loadBalancer ? [{ name: loadBalancer }] : undefined,
      targetGroupInfoList: loadBalancingType === "Application" && elbTargetGroup ? [{ name: elbTargetGroup }] : undefined,
    },
    ec2TagFilters: parsedEc2TagFilters || undefined,
    onPremisesInstanceTagFilters: parsedInstanceTagFilters || undefined,
    autoScalingGroups,
  };
}

function prepareCreateDeploymentConfigPayload(params) {
  if (!(params.minHealthyHostsNum || params.minHealthyHostsPercent)) {
    throw new Error("Please provide \"Minimum Healthy Hosts\" either by number or by percentage.");
  }
  if (params.minHealthyHostsPercent && params.minHealthyHostsNum) {
    throw new Error("Can't provide both minimum by number and by percentage.");
  }

  return {
    deploymentConfigName: params.name,
    minimumHealthyHosts: {
      type: params.minHealthyHostsNum ? "HOST_COUNT" : "FLEET_PERCENT",
      value: params.minHealthyHostsNum || params.minHealthyHostsPercent,
    },
    computePlatform: "Server",
  };
}

module.exports = {
  prepareCreateApplicationPayload,
  prepareCreateDeploymentGroupPayload,
  prepareCreateDeploymentConfigPayload,
};
