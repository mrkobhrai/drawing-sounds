import axios from 'axios';

/**
 * @param {React.RefObject<InputGraph>} graphRef Reference to input graph
 */
class PointFetcher {
    constructor(graphRef) {
        this.graphRef = graphRef;
    }
    
    fetchUserPoints = () => {
        const graph = this.graphRef.current;
        if(graph) 
        {
            const pointsMap = graph.state.points;
            const getY = graph.getYFromYCoord;
            const getX = graph.getXFromXCoord;
            return Array.from(pointsMap.values()).map(point => [getX(point.x), getY(point.y)]);
        }
        throw new Error("No graph found on the current screen");
    }

    fetchData = async () => {
        const points = this.fetchUserPoints();
        const postBody = { points };
        const data = await axios.post('http://localhost:5000/', postBody)
            .then(result => result.data.samples)
            .catch((error) => { 
                return [[]];
            });
        this.graphRef.current?.setGeneratedPoints(data[0])
    }
}

export default PointFetcher;