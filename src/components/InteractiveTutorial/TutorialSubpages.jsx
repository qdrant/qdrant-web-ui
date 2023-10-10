import * as Another from './MdxPages/Another.mdx';
import * as Other from './MdxPages/Other.mdx';
import * as Index from './MdxPages/Index.mdx';

/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

export const tutorialIndexPage = Index;
const tutorialSubPages = [
  ['another-page', Another],
  ['other', Other],
];

export { tutorialSubPages };

export default tutorialSubPages;
