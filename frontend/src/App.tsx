import React, {createRef} from 'react';
import './App.css';
import InputGraph from "./InputGraph";
import * as Tone from 'tone';

function App() {
  let ref = createRef<InputGraph>();
  const inputGraph = <InputGraph ref={ref}/>;

  const osc = new Tone.Oscillator().toDestination();
  // repeated event every 8th note
  Tone.Transport.schedule((time) => {
    osc.start(time).stop(time + 0.1);
  }, "8n");

  function play() {
    Tone.start();
    Tone.Transport.start();
  }

  function pause() {
    Tone.Transport.stop();
  }

  function reset() {
    Tone.Transport.seconds = 0;
  }

  return <div>
    {inputGraph}
    <button onClick={() => ref.current?.resetPoints()}>RESET</button>
    <button onClick={play}>PLAY</button>
    <button onClick={pause}>PAUSE</button>
    <button onClick={reset}>RESET</button>
  </div>
}

export default App;
