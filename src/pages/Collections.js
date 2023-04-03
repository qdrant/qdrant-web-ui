import React, { useState, useEffect } from 'react';
import { getCollections } from '../common/client';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Stack,
    Typography,
    Button,
    Box
} from '@mui/material';

import SearchToolbar from '../components/CollectionsSearchbar';
import { DataGrid } from '@mui/x-data-grid';
import ResultEditorWindow from '../components/ResultEditorWindow';
import { style } from '@mui/system';


function Collections() {

    const defaultResult =
        `{
    "help":"Click View to see Your collection here"
}`

    const [singleCollection, setSingleCollection] = useState(defaultResult);

    const [collections, setCollections] = useState([]);

    useEffect(() => {
        getCollections().then((response) => {
            setCollections(response.collections);
        });
    }, []);

    const [filterName, setFilterName] = useState('');

    const handleFilterByName = (event) => {
        setFilterName(event.target.value);
    };

    const rows = collections.map((collection, index) => ({
        id: index + 1,
        name: collection.name,
    })).sort((a, b) => a.name.localeCompare(b.name));

    const filteredRows = rows.filter(
        (row) =>
            Object.keys(row).some((field) => {
                const value = row[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().indexOf(filterName.toLowerCase()) > -1;
                }
                return false;
            }),
    );

    const columns = [
        // { field: 'id', headerName: 'ID', width: 90 },
        { field: 'none', headerName: '', width: 70 },      //Temporary trick to shift first column to right
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            renderCell: (params) => (viewButton(params.row.name)),
        },
        {
            field: 'more',
            headerName: 'More',
            flex: 1,
            renderCell: (params) => (visitCollection(params.row.name)),
        },
    ];

    const getSingleCollection = collectionName => {
        axios.get(`/collections/${collectionName}`)
            .then((response) => {
                console.log('resp', response.data.result)
                setSingleCollection(JSON.stringify(response.data.result))
            })
    }

    const viewButton = (name) => {
        return (
            <Button variant="outlined" onClick={() => getSingleCollection(name)}
            sx={{
                '&:hover': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
              }}>
                View
            </Button>)
    }

    const visitCollection = (collectionName) =>{
        return(
            <Link to={`/collections/${collectionName}`} style={{textDecoration:"none"}}>
                <Button variant='contained' 
                sx={{
                backgroundColor:"#dc244c",
                '&:hover': {
                    backgroundColor: '#F24268',
                  },
                }}>More</Button>
            </Link>
        )
    }

    return (
        <>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "space-around"
            }}>
                <Box sx={{ width: "45%" }}>
                    <Stack direction="row" alignItems="center" mb={5}>
                        <Typography variant="h4" gutterBottom>
                            Collections
                        </Typography>
                    </Stack>
                    <Stack>

                        {/* Search Collections Tollbar */}
                        <SearchToolbar filterName={filterName} onFilterName={handleFilterByName} />

                        {/* Collections Table */}
                        <Box sx={{ overflowX: "hidden" }}>
                            <DataGrid
                                sx={{
                                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                                        outline: "none !important",
                                    },
                                    "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus":
                                    {
                                        outline: "none !important",
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        overflowX: 'hidden',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: 'rgba(242,242,242)',
                                        fontWeight: 'bold',
                                    }
                                }}
                                autoHeight={true}
                                rows={filteredRows}
                                columns={columns}
                                pageSize={5}
                                checkboxSelection
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 20]}
                                disableRowSelectionOnClick
                                rowHeight={61}
                            />
                        </Box>
                    </Stack>
                </Box>

                {/* Single Collection Details Window */}
                <Box
                    sx={{
                        width: "45%",
                        borderRadius: "4px",
                        overflowY: "hidden",
                        border: "1px solid rgba(224, 224, 224, 1)"
                    }}>
                    <ResultEditorWindow code={singleCollection} />
                </Box>
            </Box>
        </>
    );
}

export default Collections; 