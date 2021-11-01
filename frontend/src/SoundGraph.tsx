import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';
import {FetchDataBody} from "./PointFetcher";

interface Props {
    width?: number,
    height?: number,
    getDataFunc: (body: FetchDataBody) => Promise<number[][]>
    soundGenFunc: (points: {
                            x: number;
                            y: number;
                        }[]) => void
    resetSoundFunc: () => void
    kernel: string,
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
}

interface State {
    userPoints: { x: number; y: number; }[]
    generatedPoints: { x: number; y: number; }[]
    kernel: string,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
}

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50

    state: State = {
        userPoints: [],
        generatedPoints: [],
        kernel: this.props.kernel,
        minX: this.props.minX ?? 0,
        maxX: this.props.maxX ?? 5,
        minY: this.props.minY ?? 0,
        maxY: this.props.maxY ?? 10,
    }

    handleClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            this.state.userPoints.push({x, y})
            this.onPlot();
        }
    };

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * (this.state.maxX - this.state.minX) + this.state.minX;

    calcYFromYCoord = (yCoord: number) => this.state.maxY - (yCoord / (this.height - this.axisLength) * (this.state.maxY - this.state.minY));

    getUserPoints: () => number[][] = () => {
        return this.state.userPoints.map(point => [point.x, point.y])
    }

    onPlot = async () => {
        // Get the user points
        const userData = this.getUserPoints();
        // Get the gaussian data
        const generatedData = (await this.props.getDataFunc({points: userData, kernel: this.state.kernel}))[0];
        // Calculate the distribution for the number of data points and X axis
        const xDistribution = this.state.maxX / generatedData.length;
        // Filter returned values to be positive
        const structuredGeneratedData = generatedData.filter((y)=> y >= this.state.minY).map((y, i) => ({x: xDistribution * i, y: y}));
        // Generate the sound
        this.props.soundGenFunc(structuredGeneratedData);
        // Update the generated points state
        this.state.generatedPoints = structuredGeneratedData;
        // Force a component rerender by updating the state
        this.setState({});
    }

    resetPoints = () => {
        // Reset state
        this.setState({
            userPoints: [],
            generatedPoints: []
        });
        // Clear the sound
        this.props.resetSoundFunc();
    }

    render () {
            return (
                <div style={{margin:"150px"}}>
                    <ComposedChart width={this.width} height={this.height} onClick={this.handleClick} >
                        <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                        <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                        <XAxis type="number" dataKey="x" domain={[this.state.minX, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} />
                        <YAxis type="number" domain={[this.state.minY, this.state.maxY]} interval={(this.state.maxY - this.state.minY) / 10} tickCount={this.state.maxY + 1} width={this.axisLength} />
                        <Tooltip />
                    </ComposedChart>
                </div>
            )
    }
}

export default SoundGraph;