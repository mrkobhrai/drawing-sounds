import styles from './SASSStyles.module.scss'
import GraphPoint from "./GraphPoint";
import React from "react";

interface Props {
    width?: number,
    height?: number,
    no_horiz_subdivisions?: number,
    no_vert_subdivisions?: number,
    soundGenFunc: () => void,
}

interface State{
    nextPointId: number,
    points: Map<number, GraphPoint>,
}

class InputGraph extends React.Component<Props, State> {
    width = this.props.width ?? 1000
    widthLeftOffset = 200
    widthRightOffset = 30
    height = this.props.height ?? 500
    heightTopOffset = 30
    heightBottomOffset = 100
    no_horiz_subdivisions = this.props.no_horiz_subdivisions ?? 5
    no_vert_subdivisions = this.props.no_vert_subdivisions ?? 5

    state: State = {
        nextPointId: 0,
        points: new Map(),
    }

    handleRemovePoint: (event: React.MouseEvent, id: number) => void = (event: React.MouseEvent, id: number) => {
        event.stopPropagation()
        this.state.points.delete(id)
        this.setState({})
        this.generateSounds();
    }

    generateSounds: () => void = () => {
        this.props.soundGenFunc();
    }

    handleNewPoint: (event: React.MouseEvent) => void = (event: React.MouseEvent) => {
        const x = event.clientX
        const y = event.clientY
        if (x < this.widthLeftOffset || x > this.width - this.widthRightOffset || y < this.heightTopOffset || y > this.height - this.heightBottomOffset) {
            return
        }
        const id = this.state.nextPointId
        const point = new GraphPoint({id, x, y, handleClick: (event) => this.handleRemovePoint(event, id)})
        this.state.points.set(this.state.nextPointId, point)
        this.setState({nextPointId: this.state.nextPointId + 1})
        this.generateSounds();
    }

    generateLines = () => {
        const points = Array.from(this.state.points.values()).sort((point1, point2) => {
            return point1.compareTo(point2)
        })
        const lines = []
        for (let i = 0; i < points.length - 1; i++) {
            const leftPoint = points[i];
            const rightPoint = points[i + 1]
            lines.push(<line key={`line${i}`} className={styles.betweenPoints} x1={leftPoint.x} x2={rightPoint.x} y1={leftPoint.y} y2={rightPoint.y}/>)
        }
        return lines
    }

    generateVerticalDivisions = () => {
        const lines = []
        const toDivideLength = this.width - this.widthLeftOffset - this.widthRightOffset;
        let cnt = 0;
        for (let x = 0; x <= toDivideLength; x = x + (toDivideLength / (this.no_vert_subdivisions))) {
            lines.push(<line key={`vertical-division${cnt}`} x1={this.widthLeftOffset + x} x2={this.widthLeftOffset + x} y1={this.heightTopOffset} y2={this.height - this.heightBottomOffset}/>)
            lines.push(<text key={`vertical-division${cnt}-text`} x={this.widthLeftOffset + x} y={this.height - this.heightBottomOffset + 20}>{cnt}</text>)
            cnt++
        }

        lines.push(<text key={`vertical-division-label`} x={this.widthLeftOffset + toDivideLength / 2} y={this.height - 20} textAnchor='middle'>Bottom Label</text>)
        return <g className={styles.grid} id="xGrid ">
            {lines}
        </g>
    }

    generateHorizontalDivisions = () => {
        const lines = []
        const toDivideLength = this.height - this.heightTopOffset - this.heightBottomOffset;
        let cnt = this.no_horiz_subdivisions;
        for (let y = 0; y <= toDivideLength; y = y + (toDivideLength / (this.no_horiz_subdivisions))) {
            lines.push(<line key={`horizontal-division${cnt}`} x1={this.widthLeftOffset} x2={this.width - this.widthRightOffset} y1={y + this.heightTopOffset} y2={y + this.heightTopOffset}/>)
            lines.push(<text key={`horizontal-division${cnt}-text`} x={this.widthLeftOffset - 20} y={y + this.heightTopOffset}>{cnt}</text>)
            cnt--
        }

        lines.push(<text key={`horizontal-division-label`} x={this.widthLeftOffset / 2} y={this.heightTopOffset + toDivideLength / 2} textAnchor='middle'>Left label</text>)
        return <g className={styles.grid} id="yGrid">
            {lines}
        </g>
    }

    resetPoints = () => {
        this.setState({
            points: new Map(),
            nextPointId: 0,
        })
        this.generateSounds();
    }

    render() {
        return <svg className={styles.graph} width={this.width} height={this.height} onClick={this.handleNewPoint} fill='black'>
            {/* Grid lines and labels*/}
            {this.generateVerticalDivisions()}
            {this.generateHorizontalDivisions()}
            {this.generateLines()}
            {
                 Array.from(this.state.points.values()).map(point => {
                     return point.render()
                 })
            }
        </svg>
    }
}

export default InputGraph