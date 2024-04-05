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
import { CancelOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { CopyButton } from '../Common/CopyButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const ExpirationSelect = ({ expiration, setExpiration }) => {
  const handleChange = (event) => {
    setExpiration(event.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Expiration</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={expiration}
          label="Expiration"
          onChange={handleChange}
        >
          <MenuItem value={1}>1 day</MenuItem>
          <MenuItem value={7}>7 days</MenuItem>
          <MenuItem value={30}>30 days</MenuItem>
          <MenuItem value={90}>90 days</MenuItem>
          <MenuItem value={0}>Never</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

ExpirationSelect.propTypes = {
  expiration: PropTypes.number.isRequired,
  setExpiration: PropTypes.func.isRequired,
};

const Collections = ({ collections, setCollections }) => {
  const handleDelete = (collection) => {
    setCollections((prev) => prev.filter((c) => c !== collection));
  };

  console.log(collections);
  return (
    <Card sx={{ flexGrow: 1 }} variant="dual">
      <CardContent>
        <Box>
          <Typography component={'p'} variant={'h6'} mb={2}>
            Collections:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
            {collections.map((collection, i) => (
              <Chip
                key={collection}
                label={collection}
                sx={{ ml: i === 0 ? 0 : 2, mb: '2px' }}
                deleteIcon={
                  <Tooltip title={'Remove from set'} placement={'right'}>
                    <CancelOutlined fontSize="small" />
                  </Tooltip>
                }
                onDelete={() => handleDelete(collection)}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

Collections.propTypes = {
  collections: PropTypes.array.isRequired,
  setCollections: PropTypes.func.isRequired,
};

function JwtForm({ token, expiration, setExpiration, writable, setWritable, collections, setCollections }) {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleVisibility = () => {
    setIsVisible((prev) => !prev);
  };
  // todo:

  return (
    <form>
      <TextField
        id="outlined-basic"
        label="JWT Token"
        variant="outlined"
        sx={{ mb: 3 }}
        fullWidth
        value={isVisible ? token : '•'.repeat(token.length)}
        disabled
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleVisibility}>{isVisible ? <VisibilityOff /> : <Visibility />}</IconButton>
              <CopyButton text={token} tooltip={'Copy JWT to clipboard'} successMessage={'JWT copied to clipboard'} />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ mb: 5 }}>
        <CodeBlock codeStr={'{}'} language={'json'} withRunButton onRun={() => {}} editable={false} />
      </Box>

      <Box display={'flex'} gap={2} mb={3}>
        <Card sx={{ minWidth: '35%' }} variant="dual">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {/* Switch */}
              <Switch checked={writable} onChange={(e) => setWritable(e.target.checked)} />
              <Typography component={'p'} ml={1}>
                Allow write operations
              </Typography>
            </Box>

            {/* Select */}
            <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
          </CardContent>
        </Card>
        <Collections collections={collections} setCollections={setCollections} />
      </Box>
    </form>
  );
}

JwtForm.propTypes = {
  token: PropTypes.string.isRequired,
  expiration: PropTypes.number.isRequired,
  setExpiration: PropTypes.func.isRequired,
  writable: PropTypes.bool.isRequired,
  setWritable: PropTypes.func.isRequired,
  collections: PropTypes.array.isRequired,
  setCollections: PropTypes.func.isRequired,
};

export default JwtForm;
