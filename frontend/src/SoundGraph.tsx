import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';

interface Props {
    width?: number,
    height?: number,
    getDataFunc: (points: number[][]) => Promise<number[][]>
    soundGenFunc: (points: {
                            x: number;
                            y: number;
                        }[]) => void
}

interface State {
    userPoints: { x: number; y: number; }[]
    generatedPoints: { x: number; y: number; }[]
}

class SoundGraph extends React.Component<Props, State> {
    maxX = 5
    maxY = 10
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50

    state: State = {
        userPoints: [],
        generatedPoints: []
    }

    handleClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            this.setState({ userPoints: [...this.state.userPoints, {x, y}]})
            this.onPlot();
        }
    };

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * this.maxX;

    calcYFromYCoord = (yCoord: number) => this.maxY - (yCoord / (this.height - this.axisLength) * this.maxY);

    getUserPoints: () => number[][] = () => {
        return this.state.userPoints.map(point => [point.x, point.y])
    }

    onPlot = async () => {
        const userData = this.getUserPoints();
        const generatedData = (await this.props.getDataFunc(userData))[0];
        const xDistribution = this.maxX / generatedData.length;
        const structuredGeneratedData = generatedData.filter((y)=> y >= 0).map((y, i) => ({x: xDistribution * i, y: y}));
        this.props.soundGenFunc(structuredGeneratedData);
        this.state.generatedPoints = structuredGeneratedData;
        this.setState({});
    }

    render () {
            return (
                <div style={{margin:"150px"}}>
                    <ComposedChart width={this.width} height={this.height} onClick={this.handleClick} >
                        <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                        <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                        <XAxis type="number" dataKey="x" domain={[0, this.maxX]} interval={0} tickCount={this.maxX + 1} height={this.axisLength} />
                        <YAxis type="number" domain={[0, this.maxY]} interval={0} tickCount={this.maxY + 1} width={this.axisLength} />
                        <Tooltip />
                    </ComposedChart>
                </div>
            )
    }
}

export default SoundGraph;