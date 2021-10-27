import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
    width: number,
    height: number,
    getDataFunc: () => { x: number; y: number; }[]
}

class SoundGraph extends React.Component<Props> {
    render () {
            const data = this.props.getDataFunc();
            return (
                <div style={{marginLeft:"150px"}}>
                    <LineChart width={this.props.width-150} height={this.props.height} data={data}>
                        <Line type="monotone" dataKey="y" dot={false} />
                        <XAxis dataKey="x" />
                        <YAxis />
                        <Tooltip />
                    </LineChart>
                </div>
            )
    }
}

export default SoundGraph;