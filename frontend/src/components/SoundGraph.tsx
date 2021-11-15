import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';
import {FetchDataBody} from "../utils/PointFetcher";
import Slider from "./Slider";
import Dropdown from "./Dropdown";
import Button from "./Button";
import {Kernel, kernels, periodicKernel} from "../utils/Kernel";
import {stat} from "fs";

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
    kernel: Kernel,
    params: Map<string, number>,
    lengthScale: number,
    maxX: number,
    maxY: number,
    drawMode: boolean,
    clickHeld: boolean,
}

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50

    state: State = {
        userPoints: [],
        generatedPoints: [],
        kernel: periodicKernel,
        params: new Map(),
        lengthScale: 1,
        maxX: 5,
        maxY: 10,
        drawMode: false,
        clickHeld: false,
    }

    addPoint = (e: any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            this.state.userPoints.push({x, y});
        }
    }

    handleGraphClick = (e:any) => {
        if (e) {
            if (!this.state.drawMode) {
                this.addPoint(e)
                this.onPlot();
                this.setState({})
            } else {
                this.onPlot();
                this.setState({clickHeld: !this.state.clickHeld})
            }
        }
    };

    handleMouseMove = (e:any) => {
        if (e) {
            if (this.state.clickHeld) {
                this.addPoint(e)
            }
        }
    }

    handleXAxisSet = (e:any) => {
        this.setState({maxX: parseInt(e.target.value)});
        this.onPlot();
    }

    handleLengthscaleSet = (e:any) => {
        this.setState({lengthScale: parseInt(e.target.value)});
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
        const generatedData = (await this.props.getDataFunc({points: userData, kernel: this.state.kernel.name, params: this.state.params}))[0];
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
        this.state.userPoints.splice(0, this.state.userPoints.length)
        this.state.generatedPoints.splice(0, this.state.generatedPoints.length)
        this.state.params.clear()
        this.props.resetSoundFunc();
        this.setState({})
    }

    generateKernelDropdownAndParameters = () => {
        return <td className="params">
            <label className="paramLabel">
                <Dropdown keyVals={new Map(kernels.map(kernel => [kernel.label, kernel.name]))} onChange={(e) => {
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
                    this.setState({})
                }}/>
            })}
        </td>
    }

    generateDrawTypeDropdown = () => {
        return <td className="params">
            <label className="paramLabel">
                <Dropdown keyVals={new Map([['Click points', 'false'],['Draw line','true']])} onChange={(e) => {
                    this.setState({drawMode: e.target.value === 'true'})
                }}/>
            </label>
        </td>
    }

    generateTable: () => JSX.Element = () => {
        return <table className="params">
            <tbody>
                <tr>
                    <td className="params">
                        <Button label="Resample Graph" onChange={this.onPlot}/>
                    </td>
                    <td className="params">
                        <Button label="Reset Graph" onChange={this.resetPoints}/>
                    </td>
                    <td className="params">
                        <Button label="PLAY" onChange={this.props.playSoundFunc}/>
                    </td>
                </tr>
                <tr>
                    <td className="params" colSpan={3}>
                        <Slider name={`X Axis Range`} min={1} max={20} value={this.state.maxX} onChange={(e) => this.handleXAxisSet(e)}/>
                    </td>
                </tr>
                <tr>
                    {this.generateKernelDropdownAndParameters()}
                    {this.generateDrawTypeDropdown()}
                </tr>
            </tbody>
        </table>
    }

    render () {
            return (
                <div className="graph-container">
                    <ComposedChart width={this.width} height={this.height} onClick={this.handleGraphClick} onMouseMove={this.handleMouseMove}>
                        <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                        <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                        <XAxis type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} />
                        <YAxis type="number" domain={[0, this.state.maxY]} interval={0} tickCount={this.state.maxY + 1} width={this.axisLength} />
                        <Tooltip />
                    </ComposedChart>
                    {this.generateTable()}
                </div>
            )
    }
}

export default SoundGraph;