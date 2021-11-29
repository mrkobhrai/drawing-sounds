import React from "react";

interface Props {
    name: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
}

const Slider = (props: Props): JSX.Element => {
    return <label className="paramLabel">
        {`${props.name}: ${props.value}`}
        <input type="range" min={props.min} max={props.max} step={props.step} value={props.value} onChange={props.onChange}  className="slider"/>
    </label>
}

export default Slider
