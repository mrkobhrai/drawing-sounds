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
}

interface State {
    userPoints: { x: number; y: number; }[]
    generatedPoints: { x: number; y: number; }[]
    kernel: string
}

const kernels = {
    'Periodic': 'periodic',
    'Square Rational': 'sqrat',
  }

class SoundGraph extends React.Component<Props, State> {
    maxX = 5
    maxY = 10
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50

    state: State = {
        userPoints: [],
        generatedPoints: [],
        kernel: 'periodic',
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
        // Get the user points
        const userData = this.getUserPoints();
        // Get the gaussian data
        const generatedData = (await this.props.getDataFunc({points: userData, kernel: this.state.kernel}))[0];
        // Calculate the distribution for the number of data points and X axis
        const xDistribution = this.maxX / generatedData.length;
        // Filter returned values to be positive
        const structuredGeneratedData = generatedData.filter((y)=> y >= 0).map((y, i) => ({x: xDistribution * i, y: y}));
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
      

    generateKernelDropdown: () => void = () => {
        const options = []
        for (let [label, value] of Object.entries(kernels)) {
          options.push(<option label={label} value={value}/>)
        }
        return <select onChange={(e) => {
          this.setState({kernel: e.target.value})
        }}>
          {options}
        </select>
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
                    {this.generateKernelDropdown()}
                </div>
            )
    }
}

export default SoundGraph;