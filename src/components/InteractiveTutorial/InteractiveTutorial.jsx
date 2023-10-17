import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ResultEditorWindow from '../ResultEditorWindow';
import { useTheme } from '@mui/material/styles';
import { mdxComponents } from './MdxComponents/MdxComponents';
import { useTutorial } from '../../context/tutorial-context';
import { TutorialFooter } from './TutorialFooter';
import { tutorialSubPages, tutorialIndexPage } from './TutorialSubpages';
import { useLocation } from "react-router-dom";
import { Prism } from "prism-react-renderer";

const InteractiveTutorial = ({ pageSlug }) => {
  const theme = useTheme();
  const { result } = useTutorial();
  const location = useLocation();
  const tutorialPanelRef = React.useRef(null);

  useEffect(() => {
    // we need this to use prismjs support for json highlighting
    // which is not included in the prism-react-renderer package by default
    window.Prism = Prism; // (or check for window is undefined for ssr and use global)
    (async () => await import('prismjs/components/prism-json'))();
  }, []);

  useEffect(() => {
    if (tutorialPanelRef.current) {
      tutorialPanelRef.current.scrollTop = 0;
    }
  }, [location]);

  let TagName;
  try {
    TagName = tutorialSubPages.find((p) => p[0] === pageSlug)[1].default;
  } catch (e) {
    TagName = tutorialIndexPage.default;
  }

  return (
    <PanelGroup direction="horizontal">
      <Panel style={{ position: 'relative' }}>
        <Box
          sx={{
            px: 2,
            pt: 4,
            pb: 20,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'scroll',
          }}
          ref={tutorialPanelRef}
        >
          <TagName components={mdxComponents} />
          <TutorialFooter pageSlug={pageSlug} />
        </Box>
      </Panel>
      <PanelResizeHandle
        style={{
          width: '10px',
          background: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          &#8942;
        </Box>
      </PanelResizeHandle>
      <Panel>
        <ResultEditorWindow code={result ?? '{}'} />
      </Panel>
    </PanelGroup>
  );
};

InteractiveTutorial.propTypes = {
  pageSlug: PropTypes.string,
};

export default InteractiveTutorial;
