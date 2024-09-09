import * as Index from './MdxPages/Index.mdx';
import * as Quickstart from './MdxPages/Quickstart.mdx';
import * as Filtering from './MdxPages/Filtering.mdx';
import * as Multivectors from './MdxPages/Multivectors.mdx';
import * as Multitenancy from './MdxPages/Multitenancy.mdx';
/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

export const tutorialIndexPage = Index;
const tutorialSubPages = [
  ['quickstart', Quickstart],
  ['filtering', Filtering],
  ['multivectors', Multivectors],
  ['multitenancy', Multitenancy],
  // add more pages here
];

export { tutorialSubPages };

export default tutorialSubPages;
