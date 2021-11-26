import SoundGraph from '../components/SoundGraph';
import React from "react";
import {FetchDataBody} from "../Interfaces";

const BACKEND_WS_URL = 'ws://localhost:5000/gaussian'

const SOCKET_CONNECTION = {
    CONNECTING: 'Connecting',
    CONNECTED: 'Connected :)',
    LOST_CONNECTION: 'Lost connection, trying to reconnect...',
}

class PointFetcher {
    ws = new WebSocket(BACKEND_WS_URL)
    graphRef: React.RefObject<SoundGraph>;
    setSocketLoading: React.Dispatch<React.SetStateAction<string>>;

    constructor(graphRef: React.RefObject<SoundGraph>, setSocketLoading: React.Dispatch<React.SetStateAction<string>>) {
        this.connectSocket();
        this.graphRef = graphRef;
        this.setSocketLoading = setSocketLoading;
    }

    connectSocket = () => { 
        this.ws.onopen = () => this.setSocketLoading(SOCKET_CONNECTION.CONNECTED);
        this.ws.onclose = () => this.setSocketLoading(SOCKET_CONNECTION.LOST_CONNECTION);
        this.ws.onmessage = (evt) => this.graphRef.current?.onData(evt.data)
        this.ws.onerror = () => {
            this.setSocketLoading(SOCKET_CONNECTION.LOST_CONNECTION);
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
            ...Object.fromEntries(body.params),
            optimiseParams: body.optimiseParams,
        };

        if (this.ws.readyState) {
            this.ws.send(JSON.stringify(postBody))
        }
    }
}

export {PointFetcher, SOCKET_CONNECTION};