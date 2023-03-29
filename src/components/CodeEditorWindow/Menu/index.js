import React, { useState } from 'react';
import {  Button, Stack } from '@mui/material'
import { History } from './history';

export default function Menu({ code, handleEditorChange }) {
  const [state, setState] = React.useState(false);
  const [currentSavedCodes, setCurrentSavedCodes] = useState(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);

  const toggleDrawer = (open) => (event) => {
    setCurrentSavedCodes(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);
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
        setState={setState}
        code={code}
        handleEditorChange={handleEditorChange}
        toggleDrawer={toggleDrawer}
        currentSavedCodes={currentSavedCodes}
        setCurrentSavedCodes={setCurrentSavedCodes}
      />
    </React.Fragment>
  );
}