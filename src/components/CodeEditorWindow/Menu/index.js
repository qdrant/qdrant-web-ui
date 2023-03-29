import React from 'react';
import {  Button, Stack } from '@mui/material'
import { History } from './history';

export default function Menu({ code, handleEditorChange }) {
  const [state, setState] = React.useState(false);
  
  const toggleDrawer = (open) => () => {
    setState(open);
  };

  return (
    <React.Fragment key={"Menu"}>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          pl: 5,
          mb: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}>
        <Button onClick={toggleDrawer(true)}>History</Button>
      </Stack>
      <History
        state={state}
        code={code}
        handleEditorChange={handleEditorChange}
        toggleDrawer={toggleDrawer}
      />
    </React.Fragment>
  );
}