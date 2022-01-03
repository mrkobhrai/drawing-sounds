import React from "react";
import {Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter, CartesianGrid} from 'recharts';
import {PointFetcher} from "../utils/PointFetcher";
import Slider from "./Slider";
import Dropdown from "./Dropdown";
import Button from "./Button";
import {exponentiatedQuadraticKernel, Kernel, kernels} from "../utils/Kernel";
import SoundGenerator from "../utils/SoundGenerator";
import {FetchRequestBody} from "../Interfaces";
import swal from "sweetalert";

interface Props {
    width?: number,
    height?: number,
    pointFetcher: PointFetcher,
}

interface State {
    soundUserPoints: { x: number; y: number; }[]
    soundGeneratedPoints: { x: number; y: number; }[]
    amplitudeUserPoints: { x: number; y: number; }[]
    amplitudeGeneratedPoints: { x: number; y: number; }[],
    isSoundMode: boolean,
    maxX: number,
    sound : {
        kernel: Kernel,
        params: Map<string, number>,
        lengthScale: number,
        maxY: number,
    },
    amplitude : {
        kernel: Kernel,
        params: Map<string, number>,
        lengthScale: number,
        maxY: number,
    }
    soundGenerator: SoundGenerator;
}

class SoundGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    height = this.props.height ?? 500
    axisLength = 50
    soundDatatag = 0
    amplitudeDatatag = 0

    state: State = {
        soundUserPoints: [],
        soundGeneratedPoints: [],
        amplitudeUserPoints: [],
        amplitudeGeneratedPoints: [],
        isSoundMode: true, // true when in sound mode, false when in amp modulation mode
        maxX: 1,
        sound: {
            kernel: exponentiatedQuadraticKernel,
            params: new Map(),
            lengthScale: 1,
            maxY: 10,
        },
        amplitude: {
            kernel: exponentiatedQuadraticKernel,
            params: new Map(),
            lengthScale: 1,
            maxY: 1,
        },
        soundGenerator: new SoundGenerator(),   
    }


    soundGenerator = () => this.state.soundGenerator;

    handleGraphClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            if (this.isSoundMode()) {
                this.soundDatatag += 1;
                this.state.soundUserPoints.push({x, y});
            } else {
                this.amplitudeDatatag += 1;
                this.state.amplitudeUserPoints.push({x,y});
            }
            this.onPlot(this.isSoundMode());
            this.setState({});
        }
    };

    setGraphState = (key: any, value: any, callback: (undefined | (()=>void))=undefined) => {
        var data: any = null;
        if (this.isSoundMode()) {
            data = {...this.state.sound};
            data[key] = value;
            data = {sound: {...data}}
        } else {
            data = {...this.state.amplitude};
            data[key] = value;
            data = {amplitude: {...data}}
        }
        this.setState(data, callback);
    }

    getGraphState = () => this.isSoundMode() ? this.state.sound : this.state.amplitude;

    handleXAxisSet = (e:any) => {
        this.setGraphState('maxX', parseInt(e.target.value))
        this.onPlot(true);
        this.onPlot(false);
    }

    handleLengthscaleSet = (e:any) => {
        this.setGraphState('lengthScale', parseInt(e.target.value));
        this.onPlot(true);
        this.onPlot(false);
    }

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) *  this.state.maxX;

    calcYFromYCoord = (yCoord: number) => this.getGraphState().maxY - (yCoord / (this.height - this.axisLength) *  this.getGraphState().maxY * 2);

    getUserSoundPoints: () => number[][] = () => {
        return this.state.soundUserPoints.map(point => [point.x, point.y])
    }

    getUserAmplitudePoints: () => number[][] = () => {
        return this.state.amplitudeUserPoints.map(point => [point.x, point.y])
    }

    getTag = (soundMode: boolean) => soundMode ? this.soundDatatag : this.amplitudeDatatag

    onPlot = async (soundMode: boolean, optimiseParams = false) => {
        // Get the user points
        const userData = soundMode ? this.getUserSoundPoints() : this.getUserAmplitudePoints();
        // Get the correct data tag
        const tag = this.getTag(soundMode)
        // Get the gaussian data
        this.props.pointFetcher.sendData({ points: userData, kernel:  this.getGraphState().kernel.name, params:  this.getGraphState().params, optimiseParams}, tag, soundMode);
    }

    onData = (data: any) => {
        let generatedData: FetchRequestBody = JSON.parse(data);
        const soundMode = generatedData['soundMode'];
        if(generatedData['dataTag'] === this.getTag(soundMode)){
            this.updateGeneratedPoints(generatedData.data, soundMode);
            generatedData.params?.forEach((keyValue) => {
                this.getGraphState().params.set(keyValue.name, keyValue.value)
            })
        }
    }

    generateDistributedDataFromPoints = (points: number[]) => {
        // Calculate the distribution for the number of data points and X axis
        const xDistribution =  this.state.maxX / points.length;
        return points.map((y, i) => ({x: xDistribution * i, y: y}));
    }

    updateGeneratedPoints = (generatedData: number[], soundMode: boolean) => {
        this.state.soundGeneratedPoints = soundMode ? this.generateDistributedDataFromPoints(generatedData) : this.state.soundGeneratedPoints;
        this.state.amplitudeGeneratedPoints = !soundMode ? this.generateDistributedDataFromPoints(generatedData) : this.state.amplitudeGeneratedPoints;
        this.soundGenerator().generateSound(this.state.soundGeneratedPoints, this.state.amplitudeGeneratedPoints);
        // Force a component rerender by updating the state
        this.setState({});
    }

    resetPoints = () => {
        this.state.soundUserPoints.splice(0, this.state.soundUserPoints.length)
        this.state.soundGeneratedPoints.splice(0, this.state.soundGeneratedPoints.length)
        this.getGraphState().params.clear()
        this.soundGenerator().resetSound();
        this.setState({})
    }

    isSoundMode = () => this.state.isSoundMode

    isAmplitudeMode = () => !this.state.isSoundMode

    soundGraphColour = () => this.isSoundMode() ? "blue":"lightblue"

    amplitudeGraphColour = () => (!this.isSoundMode()) ? "red":"pink"

    generateKernelDropdownAndParameters = () => {
        return <td className="params">
            <label className="paramLabel">
                <Dropdown keyVals={new Map(kernels.map(kernel => [kernel.label, kernel.name]))} selectedValue={this.getGraphState().kernel.name} onChange={(e) => {
                    this.setGraphState('kernel', kernels.find(kernel => kernel.name === e.target.value)!, () => {
                        this.onPlot(this.isSoundMode())
                    })
                }}/>
            </label>
            {this.getGraphState().kernel.parameters.map(param => {
                if (!this.getGraphState().params.has(param.name)) {
                    this.getGraphState().params.set(param.name, param.default)
                }
                return <Slider key={param.name} name={param.label} min={param.min} max={param.max} step={0.01} value={this.getGraphState().params.get(param.name)!} onChange={(e) => {
                    this.getGraphState().params.set(param.name, parseFloat(e.target.value))
                    this.setState({})
                }} onMouseUp={() => {
                    this.onPlot(this.isSoundMode())
                    this.setState({})
                }}/>
            })}
            <Button label="Optimise Parameters" onChange={() => this.onPlot(this.isSoundMode(), true)}/>
        </td>
    }

    showHelp = () => {
        swal({
            title: 'Instructions',
            className: 'instructions',
            text: `Sound mode or Amplitude mode: Choose on which wave to operate on.
    Resample graph: Sample a new wave from the specified points.
    Reset graph: Delete the selected wave.
    Play: In Sound mode, play the sound generated by the sound mode wave. In Amplitude mode, play the sound wave which is amplidute modulated by the amplitude mode wave.
    Pause: Pause the sound.
    Download: Download the sound that would normally be played should you press Play.
    X-Axis Range: TODO 
    Kernels: Choose which kernel to use for generating the wave. You can tweak the parameters yourself, or optimise them automatically.` // TODO: X-Axis range
        })
    }

    generateTable: () => JSX.Element = () => {
        return <table className="params">
            <tbody>
                <tr>
                    <td className="params">
                        <Button label="Show Instructions" onChange={this.showHelp}/>
                    </td>
                    <td className={"params"} >
                        <Dropdown keyVals={new Map([['Sound Mode', 'sound'], ['Amplitude Mode', 'amplitude']])} selectedValue={this.isSoundMode() ? 'sound':'amplitude'} onChange={(e)=>this.setState({isSoundMode: e.target.value === 'sound'})}/>
                    </td>
                    <td className="params">
                        <Button label="Resample Graph" onChange={() => this.onPlot(this.isSoundMode())}/>
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
                    <td className="params" colSpan={7}>
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
                    <div style={{margin: "0 0 0 17.5vw"}}>
                        <ComposedChart width={this.width} height={this.height} onClick={this.handleGraphClick} >
                            <CartesianGrid strokeDasharray={"3 3"}/>
                            <Line yAxisId="sound" dataKey="y" dot={false}  data={this.state.soundGeneratedPoints} stroke={this.soundGraphColour()} />
                            <Scatter yAxisId="sound" dataKey="y" fill={this.soundGraphColour()} data={this.state.soundUserPoints} />
                            <Line yAxisId="amp" dataKey="y" dot={false}  data={this.state.amplitudeGeneratedPoints} stroke={this.amplitudeGraphColour()} />
                            <Scatter yAxisId="amp" dataKey="y" fill={this.amplitudeGraphColour()} data={this.state.amplitudeUserPoints} />
                            <XAxis tickLine={false} axisLine={true} type="number" dataKey="x" domain={[0, this.state.maxX]} interval={0} tickCount={this.state.maxX + 1} height={this.axisLength} allowDataOverflow={true} />
                            <YAxis yAxisId="sound" orientation='left' tickLine={false} axisLine={this.isSoundMode()} type="number" domain={[-this.state.sound.maxY, this.state.sound.maxY]} interval={0} ticks={[-this.state.sound.maxY,0,this.state.sound.maxY]} width={this.axisLength}  allowDataOverflow={true} />
                            <YAxis yAxisId="amp" orientation='right' tickLine={false} axisLine={this.isAmplitudeMode()} type="number" domain={[-this.state.amplitude.maxY, this.state.amplitude.maxY]} interval={0} ticks={[-this.state.amplitude.maxY,0,this.state.amplitude.maxY]} width={this.axisLength}  allowDataOverflow={true} />
                            <Tooltip />
                        </ComposedChart>
                    </div>
                    {this.generateTable()}
                </div>

            )
    }
}

export default SoundGraph;