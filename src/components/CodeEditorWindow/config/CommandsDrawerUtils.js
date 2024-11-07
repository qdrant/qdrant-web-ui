export const resolveRequiredBodyParams = function (openapi, requestBodyContent) {
  const contentType = Object.keys(requestBodyContent)[0];
  if ('$ref' in requestBodyContent[contentType].schema) {
    const refPath = requestBodyContent[contentType].schema.$ref;
    // parse and navigate to the ref
    const pathComponents = refPath.slice(2).split('/');
    const schema = pathComponents.reduce((doc, pathComponent) => doc[pathComponent], openapi);
    return schema.required;
  } else {
    return requestBodyContent[contentType].schema.required;
  }
};

export const resolveRequiredPathParams = function (openapi, method, path) {
  const pathItem = openapi.paths[path];
  if (!pathItem || !pathItem[method]) {
    return [];
  }
  const parameters = pathItem[method].parameters || [];
  return parameters.filter((param) => param.in === 'path' && param.required).map((param) => param.name);
};
