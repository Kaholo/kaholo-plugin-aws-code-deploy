function parseArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof (value) === "string") {
    return value.split("\n").map((line) => line.trim()).filter((line) => line);
  }
  return [value];
}

function parseTags(value) {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    if (!value.every((tag) => tag.Key)) {
      throw new Error("Bad AWS Tags Format");
    }
    return value;
  }
  if (typeof (value) === "string") {
    const lines = value.split("\n").map((line) => line.trim()).filter((line) => line);
    return lines.map((line) => {
      const [key, ...val] = line.split("=");
      let joinedVal = val;
      if (Array.isArray(val)) {
        joinedVal = val.join("=");
      }
      return { Key: key, Value: joinedVal };
    });
  }
  if (typeof (value) === "object") {
    return Object.entries(value).map(([key, val]) => ({ Key: key, Value: val }));
  }
  throw new Error("Unsupported tags format!");
}

module.exports = {
  boolean: (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return !!(value && value !== "false");
  },
  text: (value) => {
    if (value) {
      return value.split("\n");
    }
    return undefined;
  },
  environmentVariables: (value) => {
    const parsedEnvironmentVariables = module.exports.text(value);
    return (
      !parsedEnvironmentVariables
        ? undefined
        : parsedEnvironmentVariables.reduce((obj, rawVariable) => {
          const [key, keyValue] = rawVariable.split(":");
          return {
            ...obj,
            [key.trim()]: keyValue.trim(),
          };
        }, {})
    );
  },
  number: (value) => {
    if (!value) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    return parsed;
  },
  autocomplete: (value) => {
    if (!value) {
      return undefined;
    }
    if (value.id) {
      return value.id;
    }
    return value;
  },
  string: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      return value.trim();
    }
    throw new Error(`Value ${value} is not a valid string`);
  },
  array: parseArray,
  tags: parseTags,
};
