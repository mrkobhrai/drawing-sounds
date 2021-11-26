import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';
import {PointFetcher} from "../utils/PointFetcher";
import Slider from "./Slider";
import Dropdown from "./Dropdown";
import Button from "./Button";
import {Kernel, kernels, periodicKernel} from "../utils/Kernel";
import SoundGenerator from "../utils/SoundGenerator";
import {FetchRequestBody} from "../Interfaces";

interface Props {
    width?: number,
    height?: number,
    pointFetcher: PointFetcher,
}

interface State {
    userPoints: { x: number; y: number; }[]
    generatedPoints: { x: number; y: number; }[]
    kernel: Kernel,
    params: Map<string, number>,
    lengthScale: number,
    maxX: number,
    maxY: number,
    soundGenerator: SoundGenerator;
}

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50
    dataTag = 0

    state: State = {
        userPoints: [],
        generatedPoints: [],
        kernel: periodicKernel,
        params: new Map(),
        lengthScale: 1,
        maxX: 5,
        maxY: 10,
        soundGenerator: new SoundGenerator(),
    }


    soundGenerator = () => this.state.soundGenerator;

    handleGraphClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            this.dataTag += 1;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            this.state.userPoints.push({x, y});
            this.onPlot();
            this.setState({});
        }
    };

    handleXAxisSet = (e:any) => {
        this.setState({maxX: parseInt(e.target.value)});
        this.onPlot();
    }

    handleLengthscaleSet = (e:any) => {
        this.setState({lengthScale: parseInt(e.target.value)});
        this.onPlot();
    }

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * this.state.maxX;

    calcYFromYCoord = (yCoord: number) => this.state.maxY - (yCoord / (this.height - this.axisLength) * this.state.maxY * 2);

    getUserPoints: () => number[][] = () => {
        return this.state.userPoints.map(point => [point.x, point.y])
    }

    onPlot = async (optimiseParams = false) => {
        // Get the user points
        const userData = this.getUserPoints();
        // Get the gaussian data
        this.props.pointFetcher.sendData({ points: userData, kernel: this.state.kernel.name, params: this.state.params, optimiseParams}, this.dataTag);
    }

    onData = (data: any) => {
        let generatedData: FetchRequestBody = JSON.parse(data);
        if(generatedData['dataTag'] === this.dataTag){
            this.updateGeneratedPoints(generatedData.data);
            generatedData.params?.forEach((keyValue) => {
                this.state.params.set(keyValue.name, keyValue.value)
            })
        }
    }

    updateGeneratedPoints = (generatedData: number[]) => {
        // Calculate the distribution for the number of data points and X axis
        const xDistribution = this.state.maxX / generatedData.length;
        // Filter returned values to be positive
        const structuredGeneratedData = generatedData.map((y, i) => ({x: xDistribution * i, y: y}));
        // Generate the sound
        this.soundGenerator().generateSound(structuredGeneratedData);
        // Update the generated points state
        this.state.generatedPoints = structuredGeneratedData;
        // Force a component rerender by updating the state
        this.setState({});
    }

    resetPoints = () => {
        this.state.userPoints.splice(0, this.state.userPoints.length)
        this.state.generatedPoints.splice(0, this.state.generatedPoints.length)
        this.state.params.clear()
        this.soundGenerator().resetSound();
        this.setState({})
    }

    generateKernelDropdownAndParameters = () => {
        return <tr>
            <td className="params">
                <label className="paramLabel">
                    <Dropdown keyVals={new Map(kernels.map(kernel => [kernel.label, kernel.name]))} onChange={(e) => {
                        this.onPlot();
                        this.state.params.clear()
                        this.setState({kernel: kernels.find(kernel => kernel.name == e.target.value)!})
                    }}/>
                </label>
                {this.state.kernel.parameters.map(param => {
                    if (!this.state.params.has(param.name)) {
                        this.state.params.set(param.name, param.default)
                    }
                    return <Slider key={param.name} name={param.label} min={param.min} max={param.max} value={this.state.params.get(param.name)!} onChange={(e) => {
                        this.state.params.set(param.name, parseInt(e.target.value))
                        this.onPlot();
                        this.setState({})
                    }}/>
                })}
                <Button label="Optimise Parameters" onChange={() => this.onPlot(true)}/>
            </td>
        </tr>

    }

    generateTable: () => JSX.Element = () => {
        return <table className="params">
            <tbody>
                <tr>
                    <td className="params">
                        <Button label="Resample Graph" onChange={() => this.onPlot()}/>
                    </td>
                    <td className="params">
                        <Button label="Reset Graph" onChange={this.resetPoints}/>
                    </td>
                    <td className="params">
                        <Button label="Play" onChange={this.soundGenerator().play}/>
                    </td>
                    <td className="params">
                        <Button label="Pause" onChange={this.soundGenerator().pause}/>
                    </td>
                </tr>
                <tr>
                    <td className="params" colSpan={4}>
                        <Slider name={`X Axis Range`} min={1} max={20} value={this.state.maxX} onChange={(e) => this.handleXAxisSet(e)}/>
                    </td>
                </tr>
                {this.generateKernelDropdownAndParameters()}
            </tbody>
        </table>
    }

    render () {
            return (
                <div className="graphContainer">
                    <div style={{margin: "0 0 0 17.5vw"}}>
                        <ComposedChart width={this.width} height={this.height} onClick={this.handleGraphClick} >
                            <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                            <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                            <XAxis type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} allowDataOverflow={true} />
                            <YAxis type="number" domain={[-this.state.maxY, this.state.maxY]} interval={0} ticks={[-this.state.maxY,0,this.state.maxY]} width={this.axisLength}  allowDataOverflow={true} />
                            <Tooltip />
                        </ComposedChart>
                    </div>
                    {this.generateTable()}
                </div>
            )
    }
}

export default SoundGraph;