import React, { useEffect, useState } from 'react';
import { SwipeableDrawer, Button, Box, Stack, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";



function SavedCode({ state, code, handleEditorChange, toggleDrawer }) {

    const [viewCode, setViewCode] = React.useState(`//Current Editor Code: \n${code}`);
    console.log(code);
    const [saveNameText, setSaveNameText] = useState("");
    const [currentSavedCodes, setCurrentSavedCodes] = useState(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);


    useEffect(() => {
        setCurrentSavedCodes(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);
        setViewCode(`//Current Editor Code: \n${code}`);
    }, [state])

    function saveCode() {
        if (saveNameText !== "") {
            const data = [...currentSavedCodes, { name: saveNameText, code: code, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() }]
            localStorage.setItem("currentSavedCodes", JSON.stringify(data));
            setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
            setSaveNameText("");
            return;
        }
    }

    const columns = [
        {
            field: "name",
            headerName: 'Name',
            minWidth: 100,
            valueGetter: (params) => params.row.name,
            flex: 1,
        },
        {
            field: "time",
            headerName: 'Time',
            width: 100,
            valueGetter: (params) => params.row.time,
        },
        {
            field: "date",
            headerName: 'Date',
            width: 100,
            valueGetter: (params) => params.row.date,
        },
        {
            field: "delete",
            headerName: "Delete",
            width: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => deleteIcon(params.row)
        },


    ];
    function deleteIcon(data) {
        return (
            <Button
                color="error"
                onClick={
                    () => {
                        const index = currentSavedCodes.indexOf(data)
                        const updateCode = [...currentSavedCodes]
                        updateCode.splice(index, 1);
                        localStorage.setItem("currentSavedCodes", JSON.stringify(updateCode));
                        setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
                        return;
                    }}
            >
                <DeleteIcon />
            </Button>
        );
    }
    return (
        <React.Fragment key={"SavedCode"}>
            <SwipeableDrawer
                anchor="top"
                open={state}
                onClose={toggleDrawer("savedCode", false)}
                onOpen={toggleDrawer("savedCode", true)}
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            width: "60%",
                            height: "100%",
                            overflow: "hidden",
                            overflowY: "scroll",
                        }}>
                        <Typography variant="h5" m={2} gutterBottom>
                            Saved Code
                        </Typography>
                        <Stack direction="row" spacing={2}>

                            <Typography variant="h6" m={2} gutterBottom>
                                Name Code :
                                <TextField
                                    placeholder=" Required"
                                    variant="standard"
                                    value={saveNameText}
                                    onChange={(e) => {
                                        setSaveNameText(e.target.value);
                                    }}
                                />
                                <Button onClick={saveCode}>Save</Button>
                            </Typography>
                        </Stack>
                        {currentSavedCodes.length === 0 &&
                            (
                                <Stack direction="row" spacing={2} >
                                    <Typography variant="h6" m={2} gutterBottom>
                                        No save code found
                                    </Typography>
                                </Stack>
                            )
                        }
                        <Stack
                            direction="column"
                            justifyContent="center"
                            alignItems="stretch"
                            spacing={2}
                            m={2}
                        >
                            {currentSavedCodes.length > 0 &&
                                <div style={{ height: "375px", width: '100%' }}>
                                    <DataGrid
                                        sx={{
                                            "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                                                outline: "none !important",
                                            },
                                            "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus":
                                            {
                                                outline: "none !important",
                                            },
                                        }}
                                        rows={currentSavedCodes}
                                        columns={columns}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 5,
                                                },
                                            },
                                        }}
                                        pageSizeOptions={[5, 10, 15]}
                                        rowsPerPageOptions={[5, 10]}
                                        getRowId={(row) => `${row.time} ${row.date}`}
                                        onRowClick={(params) => {
                                            setViewCode(params.row.code)
                                        }}
                                    />
                                </div>
                            }
                        </Stack>

                    </Box>
                    <Box
                        sx={{
                            width: "40%",
                            height: "100%",
                        }}
                        m={2}>
                        <Editor
                            height="475px"
                            value={(viewCode)}
                            options={{
                                scrollBeyondLastLine: false,
                                fontSize: 12,
                                wordWrap: "on",
                                minimap: { enabled: false },
                                automaticLayout: true,
                                readOnly: true,
                                mouseWheelZoom: true,
                            }}
                        />

                        <Stack direction="row" spacing={2}>
                            <Button
                                key={"apply"}
                                variant="outlined"
                                color="success"
                                onClick={
                                    () => {
                                        handleEditorChange("code", `${viewCode} \n${code}`)
                                        toggleDrawer("savedCode", false)();
                                    }}>
                                Apply Code
                            </Button>
                            <Button
                                key={"close"}
                                variant="outlined"
                                color="error"
                                onClick={toggleDrawer("savedCode", false)}
                            >
                                Close
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </SwipeableDrawer>

        </React.Fragment>
    );
}
SavedCode.propTypes = {
    state: PropTypes.bool,
    toggleDrawer: PropTypes.func,
    handleEditorChange: PropTypes.func,
    code: PropTypes.string,
}

export default SavedCode;