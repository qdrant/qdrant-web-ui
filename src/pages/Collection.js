import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Footer from '../components/Footer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function Collection() {
    const { collectionName } = useParams();
    const [collection, setCollection] = useState({});
    const [items, setItems] = useState([]);

    return (
        <>
            <Box sx={{ display: 'flex' , flexDirection: 'column', justifyContent: 'space-between', width: "100%", minHeight: '100vh' }}>
                <CssBaseline />
                <Toolbar/>
                <Box>
                <Typography variant='h3'>ToDo {collectionName}</Typography>
                </Box>
                <Footer/>
            </Box>
        </>
    );
}

export default Collection;