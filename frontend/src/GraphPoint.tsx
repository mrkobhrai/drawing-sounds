import './Styles.css'
import React from "react";

interface Props {}

interface State{}

class GraphPoint extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return <div className={'GraphPoint'}/>
    }
}

export default GraphPoint