/** A plugin for Rehype to convert meta tags of code blocks to attributes in MDX files. */

const re = /\b([-\w]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g;
const transformer = async (tree) => {
  const visit = await import('unist-util-visit');

  visit.visit(tree, `element`, (node) => {
    let match;

    if (node.tagName === `code` && node.data && node.data.meta) {
      re.lastIndex = 0; // Reset regex.

      while ((match = re.exec(node.data.meta))) {
        node.properties[match[1]] = match[2] || match[3] || match[4] || true;
      }
    }
  });
};

export const rehypeMetaAsAttributes = () => transformer;
