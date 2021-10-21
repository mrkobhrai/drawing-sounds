import axios from 'axios';

/**
 * @param {React.RefObject<InputGraph>} graphRef Reference to input graph
 */
class PointFetcher {
    constructor(graphRef) {
        this.graphRef = graphRef;
    }
    
    fetchUserPoints = () => {
        const pointsMap = this.graphRef.current?.state.points;
        if(pointsMap) {
            return Array.from(pointsMap.values()).map(point => [point.x, point.y]);
        }
        throw new Error("No graph found on the current screen");
    }

    fetchData = () => {
        const points = this.fetchUserPoints();
        const postBody = { points };
        axios.post('http://localhost:5000/', postBody).then(console.log);
    }
}

export default PointFetcher;