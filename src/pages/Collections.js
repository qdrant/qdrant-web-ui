import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { getCollections } from '../common/client';


function Collections() {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        getCollections().then((response) => {
            setCollections(response.collections);
        });
    }, []);

    return (
        <>
            <h1>Collections</h1>
            <ul>
                {collections.map((collection) => (
                    <li key={collection.name}>
                        <Link to={`/collections/${collection.name}`}>{collection.name}</Link>
                    </li>
                ))}
            </ul>
        </>
    );
}



export default Collections;