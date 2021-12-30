import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';
import {PointFetcher} from "../utils/PointFetcher";
import Slider from "./Slider";
import Dropdown from "./Dropdown";
import Button from "./Button";
import {exponentiatedQuadraticKernel, Kernel, kernels} from "../utils/Kernel";
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
    userAMPoints: {x: number; y: number; }[]
    generatedAMPoints: { x: number; y: number; }[]
    kernel: Kernel,
    params: Map<string, number>,
    lengthScale: number,
    maxX: number,
    maxY: number,
    soundGenerator: SoundGenerator;
}

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 500
    height = this.props.height ?? 500
    axisLength = 50
    dataTag = 0

    state: State = {
        userPoints: [],
        generatedPoints: [],
        userAMPoints: [],
        generatedAMPoints: [],
        kernel: exponentiatedQuadraticKernel,
        params: new Map(),
        lengthScale: 1,
        maxX: 5,
        maxY: 10,
        soundGenerator: new SoundGenerator(),
    }


    soundGenerator = () => this.state.soundGenerator;

    handleGraphClick = (isAM: boolean) => (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            this.dataTag += 1;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            if (isAM) {
                this.state.userAMPoints.push({x, y})
                this.onPlot(true);
            } else {
                this.state.userPoints.push({x, y});
                this.onPlot(false)
            }
            this.setState({});
        }
    };

    handleXAxisSet = (e:any) => {
        this.setState({maxX: parseInt(e.target.value)});
        this.onPlot(true);
        this.onPlot(false);
    }

    handleLengthscaleSet = (e:any) => {
        this.setState({lengthScale: parseInt(e.target.value)});
        this.onPlot(true);
        this.onPlot(false);
    }

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * this.state.maxX;

    calcYFromYCoord = (yCoord: number) => this.state.maxY - (yCoord / (this.height - this.axisLength) * this.state.maxY * 2);

    getUserPoints: (isAM: boolean) => number[][] = (isAM) => {
        if (isAM) {
            return this.state.userAMPoints.map(point => [point.x, point.y]);
        } else {
            return this.state.userPoints.map(point => [point.x, point.y]);
        }
    }

    onPlot = async (isAM: boolean, optimiseParams = false) => {
        // Get the user points
        const userData = this.getUserPoints(isAM);
        // Get the gaussian data
        this.props.pointFetcher.sendData({ isAM: isAM, points: userData, kernel: this.state.kernel.name, params: this.state.params, optimiseParams}, this.dataTag);
    }

    onData = (data: any) => {
        let generatedData: FetchRequestBody = JSON.parse(data);
        if(generatedData['dataTag'] === this.dataTag){
            this.updateGeneratedPoints(generatedData.isAM, generatedData.data);
            generatedData.params?.forEach((keyValue) => {
                this.state.params.set(keyValue.name, keyValue.value)
            })
        }
    }

    updateGeneratedPoints = (isAM: boolean, generatedData: number[]) => {
        // Calculate the distribution for the number of data points and X axis
        const xDistribution = this.state.maxX / generatedData.length;
        // Filter returned values to be positive
        const structuredGeneratedData = generatedData.map((y, i) => ({x: xDistribution * i, y: y}));
        if (isAM) {
            // Update the generated points state
            this.state.generatedAMPoints = structuredGeneratedData;
        } else {
            // Generate the sound
            this.soundGenerator().generateSound(structuredGeneratedData);
            // Update the generated points state
            this.state.generatedPoints = structuredGeneratedData;
        }
        // Force a component rerender by updating the state
        this.setState({});
    }

    resetPoints = () => {
        this.state.userPoints.splice(0, this.state.userPoints.length)
        this.state.generatedPoints.splice(0, this.state.generatedPoints.length)
        this.state.userAMPoints.splice(0, this.state.userAMPoints.length)
        this.state.generatedAMPoints.splice(0, this.state.generatedAMPoints.length)
        this.state.params.clear()
        this.soundGenerator().resetSound();
        this.setState({})
    }

    generateKernelDropdownAndParameters = () => {
        return <td className="params">
            <label className="paramLabel">
                <Dropdown keyVals={new Map(kernels.map(kernel => [kernel.label, kernel.name]))} selectedValue={this.state.kernel.name} onChange={(e) => {
                    this.setState({kernel: kernels.find(kernel => kernel.name === e.target.value)!}, () => {
                        this.onPlot(true)
                        this.onPlot(false)
                    })
                }}/>
            </label>
            {this.state.kernel.parameters.map(param => {
                if (!this.state.params.has(param.name)) {
                    this.state.params.set(param.name, param.default)
                }
                return <Slider key={param.name} name={param.label} min={param.min} max={param.max} step={0.01} value={this.state.params.get(param.name)!} onChange={(e) => {
                    this.state.params.set(param.name, parseFloat(e.target.value))
                    this.setState({})
                }} onMouseUp={() => {
                    this.onPlot(true)
                    this.onPlot(false)
                    this.setState({})
                }}/>
            })}
            <Button label="Optimise Parameters" onChange={() => this.onPlot(false, true)}/>
        </td>
    }

    generateTable: () => JSX.Element = () => {
        return <table className="params">
            <tbody>
                <tr>
                    <td className="params">
                        <Button label="Resample Graph" onChange={() => this.onPlot(false, false)}/>
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
                    <td className={"params"}>
                        <Button label="Download" onChange={this.soundGenerator().downloadSound}/>
                    </td>
                </tr>
                <tr>
                    <td className="params" colSpan={5}>
                        <Slider name={`X Axis Range`} min={1} max={20} step={1} value={this.state.maxX} onChange={(e) => this.handleXAxisSet(e)} onMouseUp={() => {}}/>
                    </td>
                </tr>
                <tr>
                    {this.generateKernelDropdownAndParameters()}
                </tr>
            </tbody>
        </table>
    }

    render () {
            return (
                <div className="graphContainer">
                    <table style={{margin: "0 0 0 11vw"}}>
                        <tbody>
                            <tr>
                                <ComposedChart className="graph" width={this.width} height={this.height} onClick={this.handleGraphClick(false)} >
                                    <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedPoints} />
                                    <Scatter dataKey="y" fill="red" data={this.state.userPoints} />
                                    <XAxis type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} allowDataOverflow={true} />
                                    <YAxis type="number" domain={[-this.state.maxY, this.state.maxY]} interval={0} ticks={[-this.state.maxY,0,this.state.maxY]} width={this.axisLength}  allowDataOverflow={true} />
                                    <Tooltip />
                                </ComposedChart>
                                <ComposedChart className="graph" width={this.width} height={this.height} onClick={this.handleGraphClick(true)} >
                                    <Line type="monotone" dataKey="y" dot={false}  data={this.state.generatedAMPoints} />
                                    <Scatter dataKey="y" fill="red" data={this.state.userAMPoints} />
                                    <XAxis type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} allowDataOverflow={true} />
                                    <YAxis type="number" domain={[-this.state.maxY, this.state.maxY]} interval={0} ticks={[-this.state.maxY,0,this.state.maxY]} width={this.axisLength}  allowDataOverflow={true} />
                                    <Tooltip />
                                </ComposedChart>
                            </tr>
                        </tbody>
                    </table>
                    <div style={{margin: "0 0 0 17.5vw"}}>

                    </div>
                    {this.generateTable()}
                </div>
            )
    }
}

export default SoundGraph;