import React from 'react';
import Quickstart from './QuickStart.mdx';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ResultEditorWindow from '../ResultEditorWindow';
import { useTheme } from '@mui/material/styles';
import { mdxComponents } from './MdxComponents/MdxComponents';
import { useTutorial } from '../../context/tutorial-context';
import PropTypes from "prop-types";

const pages = {
  quickstart: Quickstart,
}

const InteractiveTutorial = ({pageName}) => {
  const theme = useTheme();
  const { result } = useTutorial();

  const TagName = pages[pageName] || Quickstart;

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
        >
          <TagName components={mdxComponents} />
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
  pageName: PropTypes.string,
}

export default InteractiveTutorial;
