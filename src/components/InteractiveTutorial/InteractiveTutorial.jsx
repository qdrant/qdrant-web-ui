import React, { useState } from 'react';
import Quickstart from './QuickStart.md';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ResultEditorWindow from '../ResultEditorWindow';
import { useTheme } from '@mui/material/styles';
import { markdownComponents } from './MarkdownComponents';

const InteractiveTutorial = () => {
  const theme = useTheme();
  const [result] = useState({});

  return (
    <PanelGroup direction="horizontal">
      <Panel>
        <Quickstart components={markdownComponents} />
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
        <ResultEditorWindow code={result} />
      </Panel>
    </PanelGroup>
  );
};

export default InteractiveTutorial;
