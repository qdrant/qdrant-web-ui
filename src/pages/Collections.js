import React, { useState, useEffect } from 'react';
import { getCollections } from '../common/client';
import SearchBar from '../components/Collections/SearchBar'
import CollectionCard from '../components/Collections/CollectionCard'
import { Container, Box, Stack, Typography, Grid } from '@mui/material'
import { Tune } from '@mui/icons-material';


function Collections() {
    const [rawCollections, setRawCollections] = useState([]);
    const [collections, setCollections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    async function getCollectionsCall() {
        getCollections()
            .then((response) => {
                setRawCollections(response.collections);
            })
            .catch((err) => {
                return err
            })
    }

    useEffect(() => {
        getCollectionsCall();
    }, []);


    useEffect(() => {
        setCollections(rawCollections.filter((user) => user.name.includes(searchQuery)));
    }, [searchQuery, rawCollections]);

    return (
        <>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={3}  >
                        <Typography variant="h4">
                            Collections
                        </Typography>
                        <SearchBar value={searchQuery} setValue={setSearchQuery} />
                    </Stack >
                    <Grid
                        container
                        my={3}
                        spacing={3}
                    >
                        {collections.map((collection) => (
                            <Grid
                                xs={12}
                                md={6}
                                lg={4}
                                item
                                key={collection.name}
                            >
                                <CollectionCard collection={collection} getCollectionsCall={getCollectionsCall} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </>
    );
}


export default Collections;