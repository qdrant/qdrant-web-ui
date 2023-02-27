import axios from 'axios';

export function getCollections() {
    return axios.get('/collections').then((response) => response.data.result);
}
