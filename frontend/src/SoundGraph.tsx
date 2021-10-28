import { domain } from "process";
import React from "react";
import { Line, XAxis, YAxis, Tooltip, ComposedChart, Scatter } from 'recharts';

interface Props {
    width: number,
    height: number,
    getDataFunc: () => { x: number; y: number; }[]
}

interface State {
    userPoints: { x: number; y: number; }[]
}

class SoundGraph extends React.Component<Props, State> {
    maxX = 5
    maxY = 10
    width = this.props.width
    height = this.props.height
    axisLength = 50

    state: State = {
        userPoints: []
    }

    handleClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            console.log(xCoord, yCoord);
            this.setState({ userPoints: [...this.state.userPoints, {x, y}]})
        }
    };

    calcXFromXCoord = (xCoord: number) => (xCoord - this.axisLength) / (this.width - this.axisLength) * this.maxX

    calcYFromYCoord = (yCoord: number) => this.maxY - (yCoord / (this.height - this.axisLength) * this.maxY)

    render () {
            const generatedData = this.props.getDataFunc();
            const userData = this.state.userPoints;
            return (
                <div style={{marginLeft:"150px"}}>
                    <ComposedChart width={this.width} height={this.height} onClick={this.handleClick} >
                        <Line type="monotone" dataKey="y" dot={false}  data={generatedData} />
                        <Scatter dataKey="y" fill="red" data={userData} />
                        <XAxis type="number" dataKey="x" domain={[0, this.maxX]} interval={0} tickCount={this.maxX + 1} height={this.axisLength} />
                        <YAxis type="number" domain={[0, this.maxY]} interval={0} tickCount={this.maxY + 1} width={this.axisLength} />
                        <Tooltip />
                    </ComposedChart>
                </div>
            )
    }
}

export default SoundGraph;