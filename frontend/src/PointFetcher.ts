import axios from 'axios';

export interface FetchDataBody {
    points: number[][],
    kernel: string,
}

class PointFetcher {

    fetchData: (body: FetchDataBody) => Promise<number[][]>
        = async (body: FetchDataBody) => {
        const postBody = {
            points: body.points,
            kernel: body.kernel,
        };
        const data = await axios.post('http://localhost:5000/', postBody)
            .then(result => (result.data as any).samples)
            .catch((error) => { 
                return [[]];
            });
        return data
    }
}

export default PointFetcher;