
function collectionAccessDialog(show, writable, setWritable, payload, setPayload) {


    return (
        <Dialog fullWidth open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
            <DialogTitle>Access Settings</DialogTitle>
            <DialogContent>
                <DialogContentText>Change settings here</DialogContentText>
                <JsonViewer
                    theme={theme.palette.mode}
                    value={{}}
                    displayDataTypes={false}
                    defaultInspectDepth={0}
                    rootName={false}
                    enableClipboard={false}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleSettingChange()}>Save</Button>
            </DialogActions>{' '}
        </Dialog>
    );
}


