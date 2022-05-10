const _ = require("lodash");

async function fetchRecursively(awsClient, fetchOptions = {}, payload = {}) {
  const methodPayload = { ...payload };
  if (fetchOptions.nextToken) {
    methodPayload.nextToken = fetchOptions.nextToken;
  }

  const fetchResult = await awsClient[fetchOptions.methodName](methodPayload).promise();
  const fetchedItems = fetchResult[fetchOptions.outputDataPath];

  if (!fetchResult.nextToken) {
    return fetchedItems;
  }

  const recursiveItems = await fetchRecursively(awsClient, {
    ...fetchOptions,
    nextToken: fetchResult.nextToken,
  }, payload);

  return fetchedItems.concat(recursiveItems);
}

async function arrayAsyncFilter(array, predicate) {
  const predicateValues = await Promise.all(array.map(predicate));
  return array.filter((arrayItem, index) => predicateValues[index]);
}

function parseAwsTags(tagsInput) {
  if (_.isArray(tagsInput)) {
    validateAwsTags(tagsInput);
    return tagsInput;
  }

  if (_.isPlainObject(tagsInput)) {
    return _.entries(tagsInput).map(mapEntryToAwsTag);
  }

  if (_.isString(tagsInput)) {
    const lines = removeWhitespaceAndSplitLines(tagsInput);
    const parsedLines = lines.map((line) => {
      const [tagKey, ...tagValueSegments] = line.split("=");
      return [tagKey, tagValueSegments.join("=")];
    });
    return parsedLines.map(mapEntryToAwsTag);
  }

  throw new Error(`Tags "${JSON.stringify(tagsInput)}" are in unsupported format. Supported formats are: array, object, string.`);
}

function validateAwsTags(tags) {
  const invalidTag = tags.some((tag) => !tag.Key);
  if (invalidTag) {
    throw new Error(`Tag "${JSON.stringify(invalidTag)}" is in bad AWS format.`);
  }
}

function mapEntryToAwsTag([entryKey, entryValue]) {
  return { Key: entryKey, Value: entryValue };
}

function removeWhitespaceAndSplitLines(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

module.exports = {
  arrayAsyncFilter,
  fetchRecursively,
  parseAwsTags,
};
