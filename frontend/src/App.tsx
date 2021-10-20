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
    const pointsMap = ref.current?.state.points;
    
    if(pointsMap) {
      const points = Array.from(pointsMap.values());
      
      for(let i = 0; i < points.length; i++) {
        const point = points[i];
        const divider = 100;
        const x = point.x / divider;
        const y = point.y / divider;
        Tone.Transport.schedule((time) => {
          osc.start(time);

          if (i < points.length - 1) {
            const timeOffset = (points[i+1].x/divider) - x;
            osc.stop(time + timeOffset);
          } else {
            osc.stop(time + 0.1);
          }

          pitchShifter.pitch = y;
        }, x);
      }

    }
  }

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
