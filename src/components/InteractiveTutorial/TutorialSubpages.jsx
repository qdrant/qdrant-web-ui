import * as Unrestricted from './MdxPages/Index.mdx';
import * as Restricted from './MdxPages/Index-serverless.mdx';
import * as Quickstart from './MdxPages/Quickstart.mdx';
import * as FilteringBeginner from './MdxPages/FilteringBeginner.mdx';
import * as FilteringAdvanced from './MdxPages/FilteringAdvanced.mdx';
import * as FilteringFullText from './MdxPages/FilteringFullText.mdx';
import * as Multivectors from './MdxPages/Multivectors.mdx';
import * as SparseVectors from './MdxPages/SparseVectors.mdx';
import * as HybridSearch from './MdxPages/HybridSearch.mdx';
import * as Multitenancy from './MdxPages/Multitenancy.mdx';
import * as LoadContent from './MdxPages/LoadContent.mdx';
/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

export const getTutorialIndexPage = (isRestricted) => {
  return isRestricted ? Restricted : Unrestricted;
};

const allTutorialPages = [
  ['quickstart', Quickstart],
  ['loadcontent', LoadContent],
  ['filteringbeginner', FilteringBeginner],
  ['filteringadvanced', FilteringAdvanced],
  ['filteringfulltext', FilteringFullText],
  ['multivectors', Multivectors],
  ['sparsevectors', SparseVectors],
  ['hybridsearch', HybridSearch],
  ['multitenancy', Multitenancy],
];

const restrictedTutorialPages = [
  ['filteringbeginner', FilteringBeginner],
  ['filteringadvanced', FilteringAdvanced],
  ['filteringfulltext', FilteringFullText],
];

export const getTutorialSubPages = (isRestricted) => {
  return isRestricted ? restrictedTutorialPages : allTutorialPages;
};

export const tutorialSubPages = allTutorialPages;

export default tutorialSubPages;
