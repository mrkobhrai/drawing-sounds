import axios from 'axios';
import {periodParam} from "./KernelParameter";
import {stringify} from "querystring";

export interface FetchDataBody {
    points: number[][],
    kernel: string,
    params: Map<string, number>
}

class PointFetcher {
    source = axios.CancelToken.source();
    cancelToken = this.source.token;

    fetchData: (body: FetchDataBody) => Promise<number[][]>
        = async (body: FetchDataBody) => {
        const postBody = {
            points: body.points,
            kernel: body.kernel,
            ...Object.fromEntries(body.params)
        };
        console.log(postBody)
        const data = await axios.post('http://localhost:5000/', postBody, {cancelToken: this.cancelToken})
            .then(result => (result.data as any).samples)
        return data
    }
}

export default PointFetcher;