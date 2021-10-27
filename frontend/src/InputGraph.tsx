import styles from './SASSStyles.module.scss'
import GraphPoint from "./GraphPoint";
import React from "react";

interface GeneratedPoint {
    x: number,
    y: number,
}

interface Props {
    graphWidth?: number,
    graphHeight?: number,
    no_horiz_subdivisions?: number,
    no_vert_subdivisions?: number,
    bottomLabel: string,
    bottomMinValue: number,
    bottomMaxValue: number
    leftLabel: string,
    leftMinValue: number,
    leftMaxValue: number,
    soundGenFunc: (points: GeneratedPoint[]) => void,
    fetchDataFunc: (points: number[][]) => Promise<number[][]>,
}

interface State{
    nextPointId: number,
    points: Map<number, GraphPoint>,
    generatedPoints: GeneratedPoint[],
}

class InputGraph extends React.Component<Props, State> {
    widthLeftOffset = 200
    widthRightOffset = 30
    graphWidth = this.props.graphWidth ?? 500
    width = this.graphWidth + this.widthLeftOffset + this.widthRightOffset
    heightTopOffset = 30
    heightBottomOffset = 100
    graphHeight = this.props.graphHeight ?? 500
    height = this.graphHeight + this.heightTopOffset + this.heightBottomOffset
    no_horiz_subdivisions = this.props.no_horiz_subdivisions ?? 5
    no_vert_subdivisions = this.props.no_vert_subdivisions ?? 5

    state: State = {
        nextPointId: 0,
        points: new Map(),
        generatedPoints: [],
    }

    normalizePoints: (points: GraphPoint[]) => number[][] = (points) => {
        return Array.from(points.values()).map(point => [this.normalizeXCoord(point.x), this.normalizeYCoord(point.y)])
    }

    handleRemovePoint: (event: React.MouseEvent, id: number) => void = async (event: React.MouseEvent, id: number) => {
        event.stopPropagation()
        this.state.points.delete(id)
        this.generateSounds();
        this.setState({})
    }

    generateSounds: () => void = async () => {
        const data = await this.props.fetchDataFunc(this.normalizePoints(Array.from(this.state.points.values())));
        this.setGeneratedPoints(data[0])
        this.props.soundGenFunc(Array.from(this.state.points.values()));
    }

    handleNewPoint: (event: React.MouseEvent) => void = async (event: React.MouseEvent) => {
        const x = event.clientX
        const y = event.clientY
        if (x < this.widthLeftOffset || x > this.width - this.widthRightOffset || y < this.heightTopOffset || y > this.height - this.heightBottomOffset) {
            return
        }
        const id = this.state.nextPointId
        const point = new GraphPoint({id, x, y, handleClick: (event) => this.handleRemovePoint(event, id)})
        this.state.points.set(this.state.nextPointId, point)
        this.generateSounds();
        this.setState({nextPointId: this.state.nextPointId + 1})
    }

    normalizeYCoord = (y: number) => {
        return this.graphHeight - (y - this.heightTopOffset);
    }

    normalizeXCoord = (x: number) => {
        return (x - this.widthLeftOffset);
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
        let cnt = 0;
        for (let x = 0; x <= this.graphWidth; x = x + (this.graphWidth / (this.no_vert_subdivisions))) {
            lines.push(<line key={`vertical-division${cnt}`} x1={this.widthLeftOffset + x} x2={this.widthLeftOffset + x} y1={this.heightTopOffset} y2={this.height - this.heightBottomOffset}/>)
            lines.push(<text key={`vertical-division${cnt}-text`} x={this.widthLeftOffset + x} y={this.height - this.heightBottomOffset + 20}>
                {this.props.bottomMinValue + (cnt / this.no_vert_subdivisions) * (this.props.bottomMaxValue - this.props.bottomMinValue)}
            </text>)
            cnt++
        }

        lines.push(<text key={`vertical-division-label`} x={this.widthLeftOffset + this.graphWidth / 2} y={this.height - 20} textAnchor='middle'>{this.props.bottomLabel}</text>)
        return <g className={styles.grid} id="xGrid ">
            {lines}
        </g>
    }

    generateHorizontalDivisions = () => {
        const lines = []
        let cnt = this.no_horiz_subdivisions;
        for (let y = 0; y <= this.graphHeight; y = y + (this.graphHeight / (this.no_horiz_subdivisions))) {
            lines.push(<line key={`horizontal-division${cnt}`} x1={this.widthLeftOffset} x2={this.width - this.widthRightOffset} y1={y + this.heightTopOffset} y2={y + this.heightTopOffset}/>)
            lines.push(<text key={`horizontal-division${cnt}-text`} x={this.widthLeftOffset - 50} y={y + this.heightTopOffset}>
                {this.props.leftMinValue + (cnt / this.no_horiz_subdivisions) * (this.props.leftMaxValue - this.props.leftMinValue)}
            </text>)
            cnt--
        }

        lines.push(<text key={`horizontal-division-label`} x={this.widthLeftOffset / 2} y={this.heightTopOffset + this.graphHeight / 2} textAnchor='middle'>{this.props.leftLabel}</text>)
        return <g className={styles.grid} id="yGrid">
            {lines}
        </g>
    }

    resetPoints = () => {
        this.state.points.clear()
        this.state.generatedPoints.splice(0, this.setGeneratedPoints.length)
        this.generateSounds();
        this.setState({nextPointId: 0})
    }

    setGeneratedPoints = (ys: number[]) => {
        this.state.generatedPoints.splice(0, this.setGeneratedPoints.length)
        const resolution = this.graphWidth / ys.length;

        ys.forEach((y, index) => {
            const x = index * resolution;
            if (y >= this.heightTopOffset && y <= this.height - this.heightBottomOffset) {
                this.state.generatedPoints.push({x, y});
            }
        })
        this.setState({});
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