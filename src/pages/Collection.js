import React, { useState } from 'react';
import { useParams } from 'react-router-dom';




function Collection() {
    const { collectionName } = useParams();
    const [collection, setCollection] = useState({});
    const [items, setItems] = useState([]);

    
    return (
        <div>
            ToDo {collectionName}
        </div>
    );
}

export default Collection;