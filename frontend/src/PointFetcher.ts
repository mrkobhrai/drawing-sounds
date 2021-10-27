import axios from 'axios';

class PointFetcher {

    fetchData: (points: number[][]) => Promise<number[][]> = async (points: number[][]) => {
        const postBody = { points };
        const data = await axios.post('http://localhost:5000/', postBody)
            .then(result => (result.data as any).samples)
            .catch((error) => { 
                return [[]];
            });
        return data
    }
}

export default PointFetcher;