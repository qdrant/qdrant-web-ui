import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useClient } from '../../context/client-context';

export function ApiKeyDialog({ open, setOpen, onApply }) {
    const { settings, setSettings } = useClient();
    const [showApiKey, setShowApiKey] = React.useState(false);

    const handleClickShowApiKey = () => setShowApiKey((show) => !show);


    const handleMouseDown = (event) => {
        event.preventDefault();
    };


    const [apiKey, setApiKey] = React.useState("");

    const handleClose = () => {
        setOpen(false);
    };

    const handleApply = () => {
        setSettings({ ...settings, apiKey });
        setOpen(false);
        onApply();
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Set API Key</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This instance of Qdrant might be protected by an API Key. If so, please enter your API Key to continue.
                    </DialogContentText>
                    <br />
                    <TextField
                        onChange={(e) => setApiKey(e.target.value)}
                        autoFocus
                        id="name"
                        label="API Key"
                        type={showApiKey ? "text" : "password"}
                        fullWidth
                        variant="standard"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowApiKey}
                                        onMouseDown={handleMouseDown}
                                        edge="end"
                                    >
                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleApply}>Apply</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
