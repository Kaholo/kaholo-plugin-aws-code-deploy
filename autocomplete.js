const awsPluginLibrary = require("kaholo-aws-plugin-library");
const { fetchRecursively } = require("./helpers");

function createAwsAutocompleteFunction(
  methodName,
  outputDataPath,
  [valuePath, labelPath] = [],
) {
  return async (query, params, awsClient) => {
    const fetchResult = await fetchRecursively(awsClient, {
      methodName,
      outputDataPath,
    }).catch((error) => {
      throw new Error(`Failed to list ${outputDataPath.toLowerCase()}: ${error.message || JSON.stringify(error)}`);
    });

    const mappedAutocompleteItems = fetchResult.map((fetchedItem) => {
      const autocompleteValue = valuePath ? fetchedItem[valuePath] : fetchedItem;
      const autocompleteLabel = labelPath ? fetchedItem[labelPath] : autocompleteValue;
      return awsPluginLibrary.autocomplete.toAutocompleteItemFromPrimitive(
        autocompleteValue,
        autocompleteLabel,
      );
    });

    return awsPluginLibrary.autocomplete.filterItemsByQuery(mappedAutocompleteItems, query);
  };
}

// Each autocomplete function here requires different AWS Service
module.exports = {
  CodeDeploy: {
    listAppsAuto: createAwsAutocompleteFunction("listApplications", "applications"),
    listDeploymentsConfigsAuto: createAwsAutocompleteFunction("listDeploymentConfigs", "deploymentConfigsList"),
  },
  IAM: {
    listRolesAuto: createAwsAutocompleteFunction("listRoles", "Roles", ["Arn", "RoleName"]),
  },
  AutoScaling: {
    listAutoScalingGroupsAuto: createAwsAutocompleteFunction("describeAutoScalingGroups", "AutoScalingGroups", ["AutoScalingGroupName"]),
  },
  ELB: {
    listLoadBalancersAuto: createAwsAutocompleteFunction("describeLoadBalancers", "LoadBalancerDescriptions", ["LoadBalancerName"]),
  },
  ELBv2: {
    listElbTargetGroupsuto: createAwsAutocompleteFunction("describeTargetGroups", "TargetGroups", ["TargetGroupName"]),
  },
};
