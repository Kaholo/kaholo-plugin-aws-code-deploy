const AWS = require("aws-sdk");
const awsPluginLibrary = require("@kaholo/aws-plugin-library");
const payloadFunctions = require("./payload-functions");
const autocomplete = require("./autocomplete");
const { fetchRecursively, arrayAsyncFilter } = require("./helpers");
const { credentialKeys } = require("./consts.json");

const simpleAwsMethods = {
  createApplication: awsPluginLibrary.generateAwsMethod("createApplication", payloadFunctions.prepareCreateApplicationPayload),
  createDeploymentGroup: awsPluginLibrary.generateAwsMethod("createDeploymentGroup", payloadFunctions.prepareCreateDeploymentGroupPayload),
  createDeploymentConfig: awsPluginLibrary.generateAwsMethod("createDeploymentConfig", payloadFunctions.prepareCreateDeploymentConfigPayload),
  createDeployment: awsPluginLibrary.generateAwsMethod("createDeployment", payloadFunctions.prepareCreateDeploymentPayload),
};

async function listApps(codeDeployClient) {
  const apps = await fetchRecursively(codeDeployClient, {
    methodName: "listApplications",
    outputDataPath: "applications",
  }).catch((error) => {
    throw new Error(`Failed to list applications: ${error.message || JSON.stringify(error)}`);
  });

  return { apps };
}

async function listDeploymentsConfigs(codeDeployClient) {
  const deploymentConfigs = await fetchRecursively(codeDeployClient, {
    methodName: "listDeploymentConfigs",
    outputDataPath: "deploymentConfigsList",
  }).catch((error) => {
    throw new Error(`Failed to list deployment configs: ${error.message || JSON.stringify(error)}`);
  });

  const filteredDeploymentConfigs = await arrayAsyncFilter(
    deploymentConfigs,
    async (deploymentConfigName) => {
      const {
        deploymentConfigInfo: { computePlatform },
      } = await codeDeployClient.getDeploymentConfig({
        deploymentConfigName,
      }).promise();
      return computePlatform === "Server";
    },
  );

  return { deploymentConfigs: filteredDeploymentConfigs };
}

module.exports = {
  ...awsPluginLibrary.bootstrap(
    AWS.CodeDeploy,
    {
      ...simpleAwsMethods,
      listApps,
      listDeploymentsConfigs,
    },
    {
      listRegions: awsPluginLibrary.autocomplete.listRegions,
      ...autocomplete.CodeDeploy,
    },
    credentialKeys,
  ),
  ...awsPluginLibrary.bootstrap(AWS.IAM, {}, autocomplete.IAM, credentialKeys),
  ...awsPluginLibrary.bootstrap(AWS.AutoScaling, {}, autocomplete.AutoScaling, credentialKeys),
  ...awsPluginLibrary.bootstrap(AWS.ELB, {}, autocomplete.ELB, credentialKeys),
  ...awsPluginLibrary.bootstrap(AWS.ELBv2, {}, autocomplete.ELBv2, credentialKeys),
};
