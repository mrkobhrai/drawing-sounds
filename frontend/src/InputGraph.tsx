import './Styles.css'
import GraphPoint from "./GraphPoint";
import React from "react";

interface Props {}

interface State{
    points: GraphPoint[]
}

class InputGraph extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    state: State = {
        points: [],
    }

    handleNewPoint = (event: React.MouseEvent) => {
        const x = event.clientX
        const y = event.clientY
        this.state.points.push(new GraphPoint({}))
    }
    render() {
        return <div className={'GraphBackground'} onClick={this.handleNewPoint}>
            <GraphPoint />
        </div>;
    }
}

export default InputGraph