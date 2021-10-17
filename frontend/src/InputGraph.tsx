import styles from './SASSStyles.module.scss'
import GraphPoint from "./GraphPoint";
import React from "react";

interface Props {
    width?: number,
    height?: number,
    no_horiz_subdivisions?: number,
    no_vert_subdivisions?: number,
}

interface State{
    nextPointId: number,
    points: Map<number, GraphPoint>,
}

class InputGraph extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    width: number = this.props.width ?? 1000
    height: number = this.props.height ?? 500
    no_horiz_subdivisions: number = this.props.no_horiz_subdivisions ?? 5
    no_vert_subdivisions: number = this.props.no_vert_subdivisions ?? 5

    state: State = {
        nextPointId: 0,
        points: new Map(),
    }

    handleRemovePoint: (event: React.MouseEvent, id: number) => void = (event: React.MouseEvent, id: number) => {
        event.stopPropagation()
        this.state.points.delete(id)
        this.setState({})
    }

    handleNewPoint: (event: React.MouseEvent) => void = (event: React.MouseEvent) => {
        const x = event.clientX
        const y = event.clientY
        const id = this.state.nextPointId
        const point = new GraphPoint({id, x, y, handleClick: (event) => this.handleRemovePoint(event, id)})
        this.state.points.set(this.state.nextPointId, point)
        this.setState({nextPointId: this.state.nextPointId + 1})
    }

    generateLines = () => {
        const points = Array.from(this.state.points.values()).sort((point1, point2) => {
            return point1.compareTo(point2)
        })
        const lines = []
        for (let i = 0; i < points.length - 1; i++) {
            const leftPoint = points[i];
            const rightPoint = points[i + 1]
            lines.push(<line className={styles.betweenPoints} x1={leftPoint.x} x2={rightPoint.x} y1={leftPoint.y} y2={rightPoint.y}/>)
        }
        return lines
    }

    generateVerticalDivisions = () => {
        //const lines
    }

    render() {
        return <svg className={styles.graph} width={this.width} height={this.height} onClick={this.handleNewPoint} fill='black'>
            {/* Grid lines */}
            <g className={styles.grid} id="xGrid ">
                <line x1="213" x2="213" y1="10" y2="380"/>
                <line x1="359" x2="359" y1="10" y2="380"/>
                <line x1="505" x2="505" y1="10" y2="380"/>
                <line x1="651" x2="651" y1="10" y2="380"/>
                <line x1="797" x2="797" y1="10" y2="380"/>
            </g>
            <g className={styles.grid} id="yGrid">
                <line x1="186" x2="797" y1="10" y2="10"/>
                <line x1="186" x2="797" y1="68" y2="68"/>
                <line x1="186" x2="797" y1="126" y2="126"/>
                <line x1="186" x2="797" y1="185" y2="185"/>
                <line x1="186" x2="797" y1="243" y2="243"/>
                <line x1="186" x2="797" y1="301" y2="301"/>
                <line x1="186" x2="797" y1="360" y2="360"/>
            </g>

            {/* Grid lables */}
            <g className="labels x-labels">
                <text x="213" y="400">1</text>
                <text x="359" y="400">2</text>
                <text x="505" y="400">3</text>
                <text x="651" y="400">4</text>
                <text x="797" y="400">5</text>
                <text x="450" y="450"> Time?(ms)</text>
            </g>
            <g className="labels y-labels">
                <text x="160" y="15">15</text>
                <text x="160" y="131">10</text>
                <text x="160" y="248">5</text>
                <text x="160" y="365">0</text>
                <text x="20" y="200">Something?(m)</text>
            </g>
            {
                 Array.from(this.state.points.values()).map(point => {
                     return point.render()
                 })
            }
            {
                this.generateLines()
            }
        </svg>
    }
}

export default InputGraph