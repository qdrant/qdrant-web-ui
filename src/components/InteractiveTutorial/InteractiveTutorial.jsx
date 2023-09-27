import React from 'react';
import Quickstart from './QuickStart.mdx';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ResultEditorWindow from '../ResultEditorWindow';
import { useTheme } from '@mui/material/styles';
import { markdownComponents } from './MarkdownComponents';
import { useTutorial } from '../../context/tutorial-context';

const InteractiveTutorial = () => {
  const theme = useTheme();
  const { result } = useTutorial();

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
          <Quickstart components={markdownComponents} />
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

export default InteractiveTutorial;
