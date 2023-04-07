import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { getCollections } from '../common/client';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import { styled } from '@mui/material/styles';
import { Button, Box, Stack, TextField, Typography } from '@mui/material'

  
const Item = styled(Paper)(() => ({
    textAlign: 'center',
    borderRadius: 20,
}));

const CustomBtn=styled(Button)(()=>({
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

            <Grid container m={2} sx={{ flexDirection: { xs: "column", md: "row" } }} justifyContent="space-between">
                <Typography variant="h4" gutterBottom >
                    Collections
                </Typography>

                <Typography mr={10} gutterBottom>
                    <TextField 
                        placeholder="Type Keywords..."
                        label="Search Collections..."
                        variant="filled"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                    />
                </Typography>
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
                    <Item   sx={{
                        ':hover': {
                          boxShadow: 20, // theme.shadows[20]
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