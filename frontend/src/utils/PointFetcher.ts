import axios from 'axios';
import { send } from 'process';

export interface FetchDataBody {
    points: number[][],
    kernel: string,
    params: Map<string, number>
}

class PointFetcher {
    source = axios.CancelToken.source();
    cancelToken = this.source.token;
    ws = new WebSocket('ws://localhost:5000/gaussian')

    constructor() {
        this.connectSocket();
    }

    connectSocket = () => { 
        this.ws.onopen = () => console.log("Connected socket");
        this.ws.onclose = () => console.log("Closing websocket");
        this.ws.onmessage = evt => console.log(evt.data)
    }

    sendDataMsg = (body: any) => {
        this.ws.send(JSON.stringify(body))
    }

    fetchData: (body: FetchDataBody) => Promise<number[][]>
        = async (body: FetchDataBody) => {
        const postBody = {
            points: body.points,
            kernel: body.kernel,
            ...Object.fromEntries(body.params)
        };

        if(body.points.length > 2){
            this.sendDataMsg(postBody);
        }

        const data = await axios.post('http://localhost:5000/', postBody, {cancelToken: this.cancelToken})
            .then(result => (result.data as any).samples).catch()
        return data
    }
}

export default PointFetcher;