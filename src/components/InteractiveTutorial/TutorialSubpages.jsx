import * as Index from './MdxPages/Index.mdx';
import * as Quickstart from './MdxPages/Quickstart.mdx';
import * as FilteringClauses from './MdxPages/FilteringClauses.mdx';

/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

export const tutorialIndexPage = Index;
const tutorialSubPages = [
  ['quickstart', Quickstart],
  ['filtering-clauses', FilteringClauses],
];

export { tutorialSubPages };

export default tutorialSubPages;
