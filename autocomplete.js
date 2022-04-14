const parsers = require("./parsers");

const CodeDeployService = require("./aws.codeDeploy.service");

const MAX_RESULTS = 10;
const MISSING_OR_INCORRECT_CREDENTIALS_ERROR = "Missing or incorrect credentials - please select valid access and secret keys first";

// auto complete helper methods

function mapAutoParams(autoParams) {
  const params = {};
  autoParams.forEach((param) => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/** *
 * @returns {[{id, value}]} filtered result items
 ** */
function handleResult(result, query, keyField, valField) {
  if (!result || result.length === 0) {
    return [];
  }
  const items = result.map((item) => (
    getAutoResult(keyField ? item[keyField] : item, keyField ? item[valField] : item)
  ));
  return filterItems(items, query);
}

/** *
 * @returns {{id, value}} formatted autocomplete item
 ** */
function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id,
  };
}

function filterItems(items, query) {
  let filteredItems = items;
  if (query) {
    const qWords = query.split(/[. ]/g).map((word) => word.toLowerCase()); // split by '.' or ' ' and make lower case
    filteredItems = filteredItems.filter((item) => (
      qWords.every((word) => item.value.toLowerCase().includes(word))
    ));
    filteredItems = filteredItems.sort((word1, word2) => (
      word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0])
    ));
  }
  return filteredItems.splice(0, MAX_RESULTS);
}

function listAuto(listFuncName, outputName, fields = []) {
  return async (query, pluginSettings, triggerParameters) => {
    const settings = mapAutoParams(pluginSettings); const
      params = mapAutoParams(triggerParameters);
    const client = CodeDeployService.from(params, settings);
    let nextToken; const
      items = [];
    do {
      // eslint-disable-next-line no-await-in-loop
      const result = await client[listFuncName]({
        ...params,
        nextToken,
      });
      items.push(...handleResult(result[outputName], query, ...fields));
      nextToken = result.nextToken || result.NextToken || result.Marker;
    } while (nextToken && items.length < MAX_RESULTS);
    return items;
  };
}

async function listRegions(query, pluginSettings, actionParams) {
  const [settings, params] = [mapAutoParams(pluginSettings), mapAutoParams(actionParams)];
  const resolvedParams = { ...params, region: params.region || "eu-west-2" };
  let client;
  try {
    client = CodeDeployService.from(resolvedParams, settings);
  } catch (e) {
    throw MISSING_OR_INCORRECT_CREDENTIALS_ERROR;
  }

  const ec2RegionsPromise = client.listRegions();
  const lightsailRegionsPromise = client.lightsail.getRegions().promise();

  return Promise.all([ec2RegionsPromise, lightsailRegionsPromise]).then(
    ([ec2Regions, lightsailRegions]) => ec2Regions.Regions.map((ec2Region) => {
      const lsRegion = lightsailRegions.regions.find((x) => x.name === ec2Region.RegionName);
      return lsRegion
        ? { id: ec2Region.RegionName, value: `${ec2Region.RegionName} (${lsRegion.displayName})` }
        : { id: ec2Region.RegionName, value: ec2Region.RegionName };
    }).sort((a, b) => {
      if (a.value > b.value) {
        return 1;
      }
      if (a.value < b.value) {
        return -1;
      }
      return 0;
    }),
  ).catch((err) => {
    console.error(err);
    throw MISSING_OR_INCORRECT_CREDENTIALS_ERROR;
  });
}

module.exports = {
  listRegions,
  listAppsAuto: listAuto("listApps", "applications"),
  listRolesAuto: listAuto("listRoles", "Roles", ["Arn", "RoleName"]),
  listAutoScalingGroupsAuto: listAuto("listAutoScalingGroups", "AutoScalingGroups", ["AutoScalingGroupName"]),
  listDeploymentsConfigsAuto: listAuto("listDeploymentsConfigs", "deploymentConfigsList"),
  listLoadBalancersAuto: listAuto("listLoadBalancers", "LoadBalancerDescriptions", ["LoadBalancerName"]),
  listElbTargetGroupsuto: listAuto("listElbTargetGroups", "TargetGroups", ["TargetGroupName"]),
};
