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
    playSoundFunc: () => void
}

interface State {
    userPoints: { x: number; y: number; }[]
    generatedPoints: { x: number; y: number; }[]
    kernel: string
    maxX: number,
    maxY: number,
}

const kernels = {
    'Periodic': 'periodic',
    'Square Rational': 'sqrat',
  }

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50

    state: State = {
        userPoints: [],
        generatedPoints: [],
        kernel: 'periodic',
        maxX: 5,
        maxY: 10,
    }

    handleGraphClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            this.setState({ userPoints: [...this.state.userPoints, {x, y}]})
            this.onPlot();
        }
    };

    handleXAxisSet = (e:any) => {
        this.setState({maxX: parseInt(e.target.value)});
        this.onPlot();
    }

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * this.state.maxX;

    calcYFromYCoord = (yCoord: number) => this.state.maxY - (yCoord / (this.height - this.axisLength) * this.state.maxY);

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

    generateKernelDropdown: () => any = () => {
        const options = []
        for (let [label, value] of Object.entries(kernels)) {
          options.push(<option label={label} value={value}/>)
        }
        return ( 
                <select onChange={(e) => {
                    this.setState({kernel: e.target.value})
                    }}>
                    {options}
                </select>
        )
    }

    render () {
            return (
                <div className="graph-container">
                    <ComposedChart width={this.width} height={this.height} onClick={this.handleGraphClick} >
                        <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                        <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                        <XAxis type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} />
                        <YAxis type="number" domain={[0, this.state.maxY]} interval={0} tickCount={this.state.maxY + 1} width={this.axisLength} />
                        <Tooltip />
                    </ComposedChart>
                    <table className="params">
                        <tr>
                            <td className="params">
                                <button onClick={this.onPlot}>Resample Graph</button>
                            </td>
                            <td className="params">
                                <button onClick={this.resetPoints}>Reset Graph</button>
                            </td>
                            <td className="params">
                                <button onClick={this.props.playSoundFunc}>PLAY</button>
                            </td>
                        </tr>
                        <tr>
                            <td className="params">
                                <label className="paramLabel">
                                Kernel Type
                                {this.generateKernelDropdown()}
                                </label>
                            </td>
                            <td className="params" colSpan={2}>
                                <label className="paramLabel">
                                X Axis Range ({this.state.maxX})
                                    <div className="slidecontainer">
                                        <input type="range" min="1" max="20" onChange={(e)=>this.handleXAxisSet(e)} value={this.state.maxX} className="slider" id="myRange" />
                                    </div>
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>
            )
    }
}

export default SoundGraph;