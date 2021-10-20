import React, {createRef} from 'react';
import './App.css';
import InputGraph from "./InputGraph";
import SoundGenerator from './SoundGenerator';

function App() {
  let ref = createRef<InputGraph>();
  const inputGraph = <InputGraph ref={ref}/>;
  
  const soundGenerator = new SoundGenerator(ref);

  return <div>
    {inputGraph}
    <button onClick={() => ref.current?.resetPoints()}>RESET</button>
    <button onClick={soundGenerator.playFromStart}>PLAY</button>
    <button onClick={soundGenerator.generateSound}>GENERATE</button>
  </div>
}

export default App;
