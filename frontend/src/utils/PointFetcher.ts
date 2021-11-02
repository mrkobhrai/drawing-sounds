import axios from 'axios';

export interface FetchDataBody {
    points: number[][],
    kernel: string,
}

class PointFetcher {
    source = axios.CancelToken.source();
    cancelToken = this.source.token;

    fetchData: (body: FetchDataBody) => Promise<number[][]>
        = async (body: FetchDataBody) => {
        const postBody = {
            points: body.points,
            kernel: body.kernel,
        };
        console.log("Hi")
        const data = await axios.post('http://localhost:5000/', postBody, {cancelToken: this.cancelToken})
            .then(result => (result.data as any).samples)
        return data
    }
}

export default PointFetcher;