import React, { useState, useEffect } from 'react';
import { getCollections } from '../common/client';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Stack,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchToolbar from '../components/CollectionsSearchbar';
import ResultEditorWindow from '../components/ResultEditorWindow';
import CategoryIcon from '@mui/icons-material/Category';


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

    const visitCollection = (collectionName) => {
        return (
            <Link to={`/collections/${collectionName}`} style={{ textDecoration: "none" }}>
                <Button variant='contained'
                    sx={{
                        backgroundColor: "#dc244c",
                        '&:hover': {
                            backgroundColor: '#F24268',
                        },
                    }}>More</Button>
            </Link>
        )
    }

    const colors = ['#57CA22', '#FFA319', '#5569FF', '#FF1943', '#FFFF00', '#00FFFF']

    const CustomCard = styled(Card)(
        ({ theme, index }) => ({
            padding: "27px 18px 27px 27px",
            display: "flex",
            flexDirection: 'row',
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `5px solid ${colors[index % colors.length]}`,
            borderRadius: "10px",
            boxShadow: theme.shadows[10],
            position: 'relative',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
            transform: 'translateY(-4px)',
            },
        }),
    );

    return (
        <>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "space-around"
            }}>
                <Box sx={{ width: "100%",padding:"1rem" }}>
                    <Stack direction="row" alignItems="center" ml={4} mb={5}>
                        <Typography variant="h4" gutterBottom>
                            Collections
                        </Typography>
                    </Stack>
                    <Stack>

                        {/* Search Collections Tollbar */}
                        <SearchToolbar filterName={filterName} onFilterName={handleFilterByName} />

                        {/* Collections Table */}
                        <Box sx={{ overflowX: "hidden", padding: "2rem" }}>
                            <Grid container spacing={{ xs: 4, md: 8 }}>
                                {collections.map((collection, index) => (
                                    <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                                        <Link to={`/collections/${collection.name}`} style={{ textDecoration: "none" }}>
                                            <CustomCard index={index}>
                                                <Typography variant="h5" gutterBottom>
                                                    {collection.name}
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Click to View
                                                    </Typography>
                                                </Typography>
                                                <Button variant="outlined"
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: '#1976d2',
                                                            color: '#fff',
                                                        },
                                                    }}>
                                                    View
                                                </Button>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: `${colors[index % colors.length]}`,
                                                        borderRadius: '0 0 0 30px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <IconButton sx={{ color: 'white' }}>
                                                        <CategoryIcon />
                                                    </IconButton>
                                                </Box>
                                            </CustomCard>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Stack>
                </Box>
                {/* Single Collection Details Window */}
                {/* <Box
                    sx={{
                        width: "45%",
                        borderRadius: "4px",
                        overflowY: "hidden",
                        border: "1px solid rgba(224, 224, 224, 1)"
                    }}>
                    <ResultEditorWindow code={singleCollection} />
                </Box> */}
            </Box>
        </>
    );
}

export default Collections; 