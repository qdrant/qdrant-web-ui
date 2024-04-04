import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { CodeBlock } from '../Common/CodeBlock';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { CancelOutlined, Visibility } from '@mui/icons-material';
import { CopyButton } from '../Common/CopyButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { isVisible } from '@testing-library/user-event/dist/utils';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ExpirationSelect = ({ expiration, setExpiration }) => {
  const handleChange = (event) => {
    setExpiration(event.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* <Typography component={"p"} variant={"h6"} mb={3}>Set Expiration Period:</Typography>*/}
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Expiration</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={expiration}
          label="Expiration"
          onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

ExpirationSelect.propTypes = {
  expiration: PropTypes.string.isRequired,
  setExpiration: PropTypes.func.isRequired,
};

function JwtForm() {
  const [expiration, setExpiration] = React.useState('');
  // todo:

  return (
    <form>
      <TextField
        id="outlined-basic"
        label="JWT Token"
        variant="outlined"
        sx={{ mb: 3 }}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>{isVisible ? <VisibilityOff /> : <Visibility />}</IconButton>
              <CopyButton text={''} tooltip={'Copy JWT to clipboard'} successMessage={'JWT copied to clipboard'} />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ mb: 5 }}>
        <CodeBlock codeStr={'{}'} language={'json'} withRunButton onRun={() => {}} editable={false} />
      </Box>

      <Box display={'flex'} gap={2} mb={3}>
        <Card sx={{ minWidth: '35%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {/* Switch */}
              <Switch color="primary" />
              <Typography component={'p'} ml={1}>
                Allow Global Access
              </Typography>
            </Box>

            {/* Select */}
            <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent>
            <Box>
              <Typography component={'p'} variant={'h6'} mb={2}>
                Collections:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
                <Chip
                  label={`Col 1`}
                  sx={{ mb: '2px' }}
                  deleteIcon={
                    <Tooltip title={'Remove from set'} placement={'right'}>
                      <CancelOutlined fontSize="small" />
                    </Tooltip>
                  }
                  onDelete={() => console.log('Auch!')}
                />
                <Chip
                  label={`Col 1`}
                  sx={{ ml: 2, mb: '2px' }}
                  deleteIcon={
                    <Tooltip title={'Remove from set'} placement={'right'}>
                      <CancelOutlined fontSize="small" />
                    </Tooltip>
                  }
                  onDelete={() => console.log('Auch!')}
                />
                <Chip
                  label={`Col 1`}
                  sx={{ ml: 2, mb: '2px' }}
                  deleteIcon={
                    <Tooltip title={'Remove from set'} placement={'right'}>
                      <CancelOutlined fontSize="small" />
                    </Tooltip>
                  }
                  onDelete={() => console.log('Auch!')}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </form>
  );
}

export default JwtForm;
