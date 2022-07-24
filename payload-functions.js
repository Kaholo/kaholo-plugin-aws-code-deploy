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
  const parsedEc2TagFilters = ec2TagFilters.map(addTagType);
  const parsedInstanceTagFilters = onPremisesInstanceTagFilters.map(addTagType);

  const loadBalancerInfo = {};
  if (loadBalancingType && loadBalancingType !== "None") {
    if (loadBalancingType === "Classic" && loadBalancer) {
      loadBalancerInfo.elbInfoList = [{ name: loadBalancer }];
    }
    if (loadBalancingType === "Application" && elbTargetGroup) {
      loadBalancerInfo.targetGroupInfoList = [{ name: elbTargetGroup }];
    }
  }

  const deploymentOption = (
    !loadBalancingType || loadBalancingType === "None"
      ? "WITHOUT_TRAFFIC_CONTROL"
      : "WITH_TRAFFIC_CONTROL"
  );

  const payload = {
    applicationName: application,
    deploymentGroupName: name,
    serviceRoleArn: serviceRole,
    deploymentConfigName: deploymentConfig,
    deploymentStyle: {
      deploymentOption,
      deploymentType: "IN_PLACE",
    },
    autoScalingGroups,
  };

  if (parsedEc2TagFilters) {
    payload.ec2TagFilters = parsedEc2TagFilters;
  }
  if (parsedInstanceTagFilters) {
    payload.onPremisesInstanceTagFilters = parsedInstanceTagFilters;
  }

  if (Object.keys(loadBalancerInfo).length > 0) {
    payload.loadBalancerInfo = loadBalancerInfo;
  }

  return payload;
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

function prepareCreateDeploymentPayload(params) {
  const payload = {
    applicationName: params.application,
    deploymentConfigName: params.deploymentConfig,
    deploymentGroupName: params.deploymentGroup,
  };

  const {
    pathname,
    hostname: bucket,
  } = new URL(params.s3Location);
  const bucketKey = pathname.slice(1);
  const bundleType = pathname.slice(pathname.lastIndexOf(".") + 1);

  payload.revision = {
    revisionType: "S3",
    s3Location: {
      key: bucketKey,
      bucket,
      bundleType,
    },
  };

  return payload;
}

module.exports = {
  prepareCreateApplicationPayload,
  prepareCreateDeploymentGroupPayload,
  prepareCreateDeploymentConfigPayload,
  prepareCreateDeploymentPayload,
};
