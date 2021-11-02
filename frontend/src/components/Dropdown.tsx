import {ChangeEventHandler} from "react";

interface Props {
    keyVals: Map<string, string>,
    onChange: ChangeEventHandler<HTMLSelectElement>
}

const Dropdown: (props: Props) => JSX.Element = (props) => {
    const options: JSX.Element[] = []
    props.keyVals.forEach((value, key) => {
        options.push(<option label={key} value={value}/>)
    })
    return (
        <select onChange={props.onChange}>
            {options}
        </select>
    )
}

export default Dropdown
