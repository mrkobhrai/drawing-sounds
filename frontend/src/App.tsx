import React, {ChangeEvent, createRef, useRef, useState} from 'react';
import './App.css';
import InputGraph from "./InputGraph";

function App() {
  const [parameter, setParameter] = useState(1)
  const ref = useRef<InputGraph>(null)
  const [inputGraph, setInputGraph] = useState(<InputGraph ref={ref}/>)

  const updateParameter: (event: ChangeEvent<HTMLInputElement>) => void = (event) => {
    setParameter(parseFloat(event.target.value))
  }

  return <div>
    {inputGraph}
    <button onClick={() => ref.current?.resetPoints()}>RESET</button>
    <div/>
    <label> Parameter
      <input type="number" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
      <input type="range" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
    </label>
  </div>
}
export default App;
