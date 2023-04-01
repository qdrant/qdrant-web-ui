import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollections } from '../common/client';
import { Box } from "@mui/system";
import { List, ListItem, ListItemText, ListSubheader, Stack, ListItemButton } from "@mui/material";
import { KeyboardArrowRight } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';


function Collections() {
    const [collections, setCollections] = useState([]);

    //for sorting by name and grouping by first letter
    const groupedItems = collections.sort((a, b) => a.name.localeCompare(b.name)).reduce((acc, curr) => {
        const startingLetter = curr.name.charAt(0).toUpperCase();
        if (!acc[startingLetter]) {
            acc[startingLetter] = [];
        }
        acc[startingLetter].push(curr);
        return acc;
    }, {});

    useEffect(() => {
        getCollections().then((response) => {
            setCollections(response.collections);
        });
    }, []);

    return (
        <>
            <Typography variant="h4" component="h2" sx={{margin:"0 0 2rem 2rem"}}>
                Collections
            </Typography>
            <List
                sx={{ width: '100%', maxWidth: 360 }}
                subheader={<li />}
            >
                {Object.entries(groupedItems).map(([letter, items]) => (
                    <li key={`section-${letter}`} id={`section-${letter}`}>
                        <ul>
                            <ListSubheader>{letter}</ListSubheader>
                            <Stack direction="row" spacing={1}>
                                {items.map((item, index) => (
                                    <React.Fragment key={item.name}>
                                        <ListItem
                                            key={item.name}
                                        >
                                            <Link to={`/collections/${item.name}`} style={{ textDecoration: "none", color: "black" }}>
                                                <ListItemButton
                                                    selected={false}
                                                    variant="outlined"
                                                    style={{ backgroundColor: "#ebe2e2", borderRadius: "10px" }}
                                                >
                                                    <ListItemText>{item.name}</ListItemText>
                                                    <KeyboardArrowRight />
                                                </ListItemButton>
                                            </Link>
                                            {index < items.length - 1 && (
                                                <Divider variant="middle" orientation="vertical" flexItem style={{ paddingLeft: "40px" }} />
                                            )}
                                        </ListItem>
                                        {index < items.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </Stack>
                        </ul>
                    </li>
                ))}
            </List>
        </>
    );
}



export default Collections;