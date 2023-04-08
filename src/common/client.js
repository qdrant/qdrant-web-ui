import axios from 'axios';

export function getCollections() {
    return axios.get('/collections').then((response) => response.data.result);
}

export function deleteCollections(collectionName){
    return axios.delete(`/collections/${collectionName}`).then((response) => response.data.result);
}