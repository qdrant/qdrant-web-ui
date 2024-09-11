import * as Index from './MdxPages/Index.mdx';
import * as Quickstart from './MdxPages/Quickstart.mdx';
import * as FilteringBeginner from './MdxPages/FilteringBeginner.mdx';
import * as FilteringAdvanced from './MdxPages/FilteringAdvanced.mdx';
import * as FilteringFullText from './MdxPages/FilteringFullText.mdx';
import * as Multivectors from './MdxPages/Multivectors.mdx';
import * as Multitenancy from './MdxPages/Multitenancy.mdx';
import * as LoadContent from './MdxPages/LoadContent.mdx';
/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

export const tutorialIndexPage = Index;
const tutorialSubPages = [
  ['quickstart', Quickstart],
  ['filteringbeginner', FilteringBeginner],
  ['filteringadvanced', FilteringAdvanced],
  ['filteringfulltext', FilteringFullText],
  ['multivectors', Multivectors],
  ['multitenancy', Multitenancy],
  ['loadcontent', LoadContent],
  // add more pages here
];

export { tutorialSubPages };

export default tutorialSubPages;
