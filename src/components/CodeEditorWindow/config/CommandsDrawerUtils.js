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
