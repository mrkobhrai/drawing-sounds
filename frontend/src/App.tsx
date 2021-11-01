import React, {ChangeEvent, useRef, useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import SoundGenerator from './SoundGenerator';
import PointFetcher from './PointFetcher';
import SoundGraph from './SoundGraph';

function App() {
  const graphRef = useRef<SoundGraph>(null);
  const [soundGenerator] = useState<SoundGenerator>(new SoundGenerator());
  const [pointFetcher] = useState<PointFetcher>(new PointFetcher());
  const [parameter, setParameter] = useState(1);
  const [inputGraph] = useState(<SoundGraph ref={graphRef}  soundGenFunc={soundGenerator.generateSound} resetSoundFunc={soundGenerator.resetSound} getDataFunc={pointFetcher.fetchData} playSoundFunc={soundGenerator.playFromStart} />)

  const updateParameter: (event: ChangeEvent<HTMLInputElement>) => void = (event) => {
    setParameter(parseFloat(event.target.value))
  }

  return  (
    <div>
      <h1><b>Designing Sounds By Drawing Them</b></h1>
      <h3><i>Made by 3rd Year Imperial College Computing Students</i></h3>
      {inputGraph}
      <div/>
      <label> Parameter
        <input type="number" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
        <input type="range" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
      </label>
    </div>
  )
}
export default App;