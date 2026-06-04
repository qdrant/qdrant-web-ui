import * as Quickstart from './MdxPages/Quickstart.mdx';
import * as FilteringBeginner from './MdxPages/FilteringBeginner.mdx';
import * as FilteringAdvanced from './MdxPages/FilteringAdvanced.mdx';
import * as FilteringFullText from './MdxPages/FilteringFullText.mdx';
import * as Multivectors from './MdxPages/Multivectors.mdx';
import * as SparseVectors from './MdxPages/SparseVectors.mdx';
import * as HybridSearch from './MdxPages/HybridSearch.mdx';
import * as Multitenancy from './MdxPages/Multitenancy.mdx';
import * as LoadContent from './MdxPages/LoadContent.mdx';

import * as QuickstartZh from './MdxPages_zh/Quickstart.mdx';
import * as FilteringBeginnerZh from './MdxPages_zh/FilteringBeginner.mdx';
import * as FilteringAdvancedZh from './MdxPages_zh/FilteringAdvanced.mdx';
import * as FilteringFullTextZh from './MdxPages_zh/FilteringFullText.mdx';
import * as MultivectorsZh from './MdxPages_zh/Multivectors.mdx';
import * as SparseVectorsZh from './MdxPages_zh/SparseVectors.mdx';
import * as HybridSearchZh from './MdxPages_zh/HybridSearch.mdx';
import * as MultitenancyZh from './MdxPages_zh/Multitenancy.mdx';
import * as LoadContentZh from './MdxPages_zh/LoadContent.mdx';

/**
 * MDX page object (Index etc.) contains:
 *  - default: React component
 *  - exported variables: MDX page metadata,
 *  check out the MDX files in src/components/InteractiveTutorial/MdxPages
 */

const enPages = [
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

const zhPages = [
  ['quickstart', QuickstartZh],
  ['loadcontent', LoadContentZh],
  ['filteringbeginner', FilteringBeginnerZh],
  ['filteringadvanced', FilteringAdvancedZh],
  ['filteringfulltext', FilteringFullTextZh],
  ['multivectors', MultivectorsZh],
  ['sparsevectors', SparseVectorsZh],
  ['hybridsearch', HybridSearchZh],
  ['multitenancy', MultitenancyZh],
];

export const getTutorialSubPages = (language) => {
  return language === 'zh' ? zhPages : enPages;
};

// Default export for backward compatibility
const tutorialSubPages = enPages;

export { tutorialSubPages };

export default tutorialSubPages;
