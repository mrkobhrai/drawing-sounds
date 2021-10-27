import axios from 'axios';

/**
 * @param {React.RefObject<InputGraph>} graphRef Reference to input graph
 */
class PointFetcher {
    constructor(graphRef) {
        this.graphRef = graphRef;
    }

    fetchData = async (points) => {
        const postBody = { points };
        const data = await axios.post('http://localhost:5000/', postBody)
            .then(result => result.data.samples)
            .catch((error) => { 
                return [[]];
            });
        return data
    }
}

export default PointFetcher;