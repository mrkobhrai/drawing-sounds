import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
    width: number,
    height: number,
    getDataFunc: () => { x: number; y: number; }[]
}

class SoundGraph extends React.Component<Props> {
    maxX = 5
    maxY = 10
    width = this.props.width
    height = this.props.height
    
    handleClick = (e:any) => {
        if (e) {
            const xCoord = e.chartX;
            const yCoord = e.chartY;
            const x = this.calcXFromXCoord(xCoord);
            const y = this.calcYFromYCoord(yCoord);
            console.log(x, y);
        }
    };

    calcXFromXCoord = (xCoord: number) => xCoord / this.width * this.maxX

    calcYFromYCoord = (yCoord: number) => this.maxY - (yCoord / this.height * this.maxY)

    render () {
            const data = this.props.getDataFunc();
            return (
                <div style={{marginLeft:"150px"}}>
                    <LineChart width={this.width} height={this.height} data={data} onClick={this.handleClick}>
                        <Line type="monotone" dataKey="y" dot={false} />
                        <XAxis dataKey="x" domain={[0, this.maxX]} />
                        <YAxis domain={[0, this.maxY]} />
                        <Tooltip />
                    </LineChart>
                </div>
            )
    }
}

export default SoundGraph;