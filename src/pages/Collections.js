import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollections } from '../common/client';
import SearchBar from '../components/SearchBar'
import { Button, Box, Stack, Typography, Grid, Paper, styled } from '@mui/material'

const Item = styled(Paper)(() => ({
    textAlign: 'center',
    borderRadius: 20,
}));

const CustomBtn = styled(Button)(() => ({
    borderRadius: 20,
}))

function Collections() {
    const [rawCollections, setRawCollections] = useState([]);
    const [collections, setCollections] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getCollections().then((response) => {
            setRawCollections(response.collections);
        });
    }, []);


    useEffect(() => {
        setCollections(rawCollections.filter((user) => user.name.includes(searchQuery)));
    }, [searchQuery, rawCollections]);

    return (
        <>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Grid item xs="auto" m={2}>
                    <Typography variant="h4" gutterBottom >
                        Collections
                    </Typography>
                </Grid>

                <Grid item xs="auto" m={2}>
                    <SearchBar value={searchQuery} setValue={setSearchQuery} />
                </Grid>

            </Grid>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    '& > :not(style)': {
                        m: 1,

                    },
                }}
            >
                {collections.map((collection) => (
                    <Item sx={{
                        ':hover': {
                            boxShadow: 20,
                        },
                    }}
                        elevation={3}
                        key={collection.name}
                    >
                        <Typography variant="h6" gutterBottom m={2}>
                            {collection.name}
                        </Typography>
                        <Stack spacing={2} m={2} direction="row">

                            <CustomBtn variant="outlined" size="small">View Data</CustomBtn>
                            <CustomBtn variant="outlined" size="small">Visualize</CustomBtn>
                        </Stack>
                    </Item>
                ))}
            </Box>
        </>
    );
}


export default Collections;