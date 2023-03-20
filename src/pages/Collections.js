import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Toolbar from '@mui/material/Toolbar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { getCollections } from '../common/client';
import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ListItemText from '@mui/material/ListItemText';

function Collections() {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        getCollections().then((response) => {
            setCollections(response.collections);
        });
    }, []);

    return (
        <>
            <Box sx={{ display: 'flex' , flexDirection: 'column', justifyContent: 'space-between', width: "100%", minHeight: '100vh' }}>
                <CssBaseline />
                <Toolbar/>
                <Box>
                    <Typography variant='h2'>Collections</Typography>
                    <List >
                        {
                            collections.map((collection, index) => (
                                <ListItem key={collection.name} justifyContent="center">
                                    <Link to={`/collections/${collection.name}`} style={{ color: 'white', textDecoration: 'none'}}>
                                        <ListItemText primary={`${index+1}.  ${collection.name}`} />
                                    </Link>
                                </ListItem>
                            ))
                        }
                    </List>
                </Box>
                <Footer/>
            </Box>
        </>
    );
}

export default Collections;