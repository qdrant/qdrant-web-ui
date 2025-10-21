import React from 'react';
import PropTypes from 'prop-types';

import { Box, Tooltip, InputLabel } from '@mui/material';

import OutlinedInput from '@mui/material/OutlinedInput';
import { CodeBlock } from '../Common/CodeBlock/CodeBlock';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, my: -2, ...sx }}>
      <CodeBlock
        codeStr={JSON.stringify(token, null, 2)}
        language={'json'}
        editable={false}
        title={'JWT Token Payload'}
      />

      <Tooltip title="Use this JWT token as an API key to get restricted access to the Qdrant API">
        <Box sx={{ display: 'flex', flexDirection: 'column' }} role="group">
          <InputLabel htmlFor="jwt-token-output" sx={{ pb: 0.625 }}>
            JWT Token
          </InputLabel>
          <OutlinedInput
            id="jwt-token-output"
            placeholder="JWT Token"
            variant="outlined"
            fullWidth
            value={isVisible ? jwt : '•'.repeat(jwt.length)}
            disabled
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleVisibility}>{isVisible ? <VisibilityOff /> : <Visibility />}</IconButton>
                <CopyButton text={jwt} tooltip={'Copy JWT to clipboard'} successMessage={'JWT copied to clipboard'} />
              </InputAdornment>
            }
          />
        </Box>
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
