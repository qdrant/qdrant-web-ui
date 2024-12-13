export const parseCommandVariables = (command) => {
  const variablePattern = /<([^>]+)>/g;
  const variables = [];
  let match;
  while ((match = variablePattern.exec(command)) !== null) {
    variables.push(match[1]);
  }
  return variables;
};
