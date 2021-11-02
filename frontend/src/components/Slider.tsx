import React from "react";

interface Props {
    name: string,
    min: number,
    max: number,
    step?: number,
    value: number,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
}

const Slider = (props: Props): JSX.Element => {
    return <label className="paramLabel">
        {props.name}
        <input type="range" min={props.min} max={props.max} step={props.step ?? 1} value={props.value} onChange={props.onChange} className="slider"/>
    </label>
}

export default Slider
