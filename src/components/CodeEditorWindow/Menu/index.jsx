import React from 'react';
import { Button, Stack } from '@mui/material';
import History from './history';
import PropTypes from 'prop-types';
import SavedCode from './savedCode';

// deprecated
function Menu({ code, handleEditorChange }) {
  const [state, setState] = React.useState({
    history: false,
    savedCode: false,
  });

  const toggleDrawer = (name, open) => () => {
    setState({ ...state, [name]: open });
  };

  return (
    <React.Fragment key={'Menu'}>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          pl: 5,
          mb: 0,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button onClick={toggleDrawer('history', true)}>History</Button>
        <Button onClick={toggleDrawer('savedCode', true)}>Saved Code</Button>
      </Stack>
      <History state={state.history} code={code} handleEditorChange={handleEditorChange} toggleDrawer={toggleDrawer} />
      <SavedCode
        state={state.savedCode}
        code={code}
        handleEditorChange={handleEditorChange}
        toggleDrawer={toggleDrawer}
      />
    </React.Fragment>
  );
}
Menu.propTypes = {
  code: PropTypes.string,
  handleEditorChange: PropTypes.func,
};

export default Menu;
