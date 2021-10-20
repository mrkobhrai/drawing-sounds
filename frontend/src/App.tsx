import React, {createRef} from 'react';
import './App.css';
import InputGraph from "./InputGraph";
import * as Tone from 'tone';

function App() {
  let ref = createRef<InputGraph>();
  const inputGraph = <InputGraph ref={ref}/>;

  const pitchShifter = new Tone.PitchShift().toDestination();
  const osc = new Tone.Oscillator().connect(pitchShifter);

  const genSound = () => {
    const points = [{x:0, y:0.1}, {x:0.5, y:12}, {x:1, y:14}, {x:1.5, y:0.1}];
    for(let i = 0; i < points.length; i++) {
      const point = points[i];
      Tone.Transport.schedule((time) => {
        osc.start(time);
        if (i < points.length - 1) {
          const timeOffset = points[i+1].x - point.x;
          osc.stop(time + timeOffset);
        } else {
          osc.stop(0.1);
        }
        pitchShifter.pitch = point.y;
      }, point.x);
    }
  }

  genSound();

  const play = () => {
    Tone.start();
    Tone.Transport.seconds = 0;
    Tone.Transport.start(Tone.now());
  }

  return <div>
    {inputGraph}
    <button onClick={() => ref.current?.resetPoints()}>RESET</button>
    <button onClick={play}>PLAY</button>
    <button onClick={genSound}>GENERATE</button>
  </div>
}

export default App;
