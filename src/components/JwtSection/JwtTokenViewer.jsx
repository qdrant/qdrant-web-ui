import React from 'react';
import PropTypes from 'prop-types';

import { Box, Tooltip } from '@mui/material';

import TextField from '@mui/material/TextField';
import { CodeBlock } from '../Common/CodeBlock';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { CopyButton } from '../Common/CopyButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

function JwtTokenViewer({ jwt, token, sx }) {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ mb: 1 }}>
        <CodeBlock
          codeStr={JSON.stringify(token, null, 2)}
          language={'json'}
          editable={false}
          title={'JWT Token Payload'}
        />
      </Box>
      <Tooltip title="Use this JWT token as an API key to get restricted access to the Qdrant API">
        <TextField
          id="outlined-basic"
          label="JWT Token"
          variant="outlined"
          sx={{ mb: 1 }}
          fullWidth
          value={isVisible ? jwt : '•'.repeat(jwt.length)}
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleVisibility}>{isVisible ? <VisibilityOff /> : <Visibility />}</IconButton>
                <CopyButton text={jwt} tooltip={'Copy JWT to clipboard'} successMessage={'JWT copied to clipboard'} />
              </InputAdornment>
            ),
          }}
        />
      </Tooltip>
    </Box>
  );
}

JwtTokenViewer.propTypes = {
  jwt: PropTypes.string.isRequired,
  token: PropTypes.object.isRequired,
  sx: PropTypes.object,
};

export default JwtTokenViewer;
