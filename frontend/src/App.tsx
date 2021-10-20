import React, {ChangeEvent, createRef, useRef, useState} from 'react';
import './App.css';
import InputGraph from "./InputGraph";
import SoundGenerator from './SoundGenerator';

function App() {
  const graphRef = useRef<InputGraph>(null);
  const soundGenerator = new SoundGenerator(graphRef);
  
  const [parameter, setParameter] = useState(1);
  const [inputGraph, setInputGraph] = useState(<InputGraph ref={graphRef}/>)

  const updateParameter: (event: ChangeEvent<HTMLInputElement>) => void = (event) => {
    setParameter(parseFloat(event.target.value))
  }

  return <div>
    {inputGraph}
    <button onClick={() => graphRef.current?.resetPoints()}>RESET</button>
    <button onClick={soundGenerator.playFromStart}>PLAY</button>
    <button onClick={soundGenerator.generateSound}>GENERATE</button>
    <div/>
    <label> Parameter
      <input type="number" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
      <input type="range" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
    </label>
  </div>
}
export default App;