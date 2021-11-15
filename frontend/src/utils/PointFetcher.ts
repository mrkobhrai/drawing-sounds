import SoundGraph from '../components/SoundGraph';

export interface FetchDataBody {
    points: number[][],
    kernel: string,
    params: Map<string, number>
}

const BACKEND_WS_URL = 'ws://localhost:5000/gaussian'

class PointFetcher {
    
    ws = new WebSocket(BACKEND_WS_URL)
    graphRef: React.RefObject<SoundGraph>;

    constructor(graphRef: React.RefObject<SoundGraph>) {
        this.connectSocket();
        this.graphRef = graphRef;
    }

    connectSocket = () => { 
        this.ws.onopen = () => console.log("Connected socket");
        this.ws.onclose = () => console.log("Closing websocket");
        this.ws.onmessage = (evt) => this.graphRef.current?.onData(evt.data)
        this.ws.onerror = () => {
            console.log("Socket failed, reestablishing connection")
            this.ws = new WebSocket(BACKEND_WS_URL)
            this.connectSocket()
        } 
    }

    sendData: (body: FetchDataBody) => void
        = async (body: FetchDataBody) => {
        const postBody = {
            points: body.points,
            kernel: body.kernel,
            ...Object.fromEntries(body.params)
        };

        if(body.points.length > 2){
            this.ws.send(JSON.stringify(postBody))
        }
    }
}

export default PointFetcher;