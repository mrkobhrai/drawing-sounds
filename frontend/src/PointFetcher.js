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
            const width = graph.width - graph.widthLeftOffset;
            const height = graph.height - graph.heightBottomOffset;
            const xRange = graph.no_horiz_subdivisions;
            const yRange = graph.no_vert_subdivisions;
            console.log(width,height, xRange, yRange);
            return Array.from(pointsMap.values()).map(point => [(point.x - graph.widthLeftOffset)/ width * xRange, (height - point.y) / height * yRange]);
        }
        throw new Error("No graph found on the current screen");
    }

    fetchData = async () => {
        const points = this.fetchUserPoints();
        const postBody = { points };
        const data = await axios.post('http://localhost:5000/', postBody)
            .then(result => result.data.samples)
            .catch((error) => { 
                console.log(error);
                return [[]];
            });
        
        this.graphRef.current?.setGeneratedPoints(data[0])
    }
}

export default PointFetcher;