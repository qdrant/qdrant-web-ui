import React, { useState } from 'react';
import { useParams } from 'react-router-dom';




function Collection() {
    const { collectionName } = useParams();
    const [collection, setCollection] = useState({});
    const [items, setItems] = useState([]);

    
    return (
        <>
            ToDo {collectionName}
        </>
    );
}

export default Collection;