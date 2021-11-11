import React, {ChangeEvent, useRef, useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import SoundGenerator from './utils/SoundGenerator';
import PointFetcher from './utils/PointFetcher';
import SoundGraph from './components/SoundGraph';

function App() {
  const graphRef = useRef<SoundGraph>(null);
  const [soundGenerator] = useState<SoundGenerator>(new SoundGenerator());
  const [pointFetcher] = useState<PointFetcher>(new PointFetcher());
  const [inputGraph] = useState(<SoundGraph ref={graphRef}  soundGenFunc={soundGenerator.generateSound} resetSoundFunc={soundGenerator.resetSound} getDataFunc={pointFetcher.fetchData} playSoundFunc={soundGenerator.play} pauseSoundFunc={soundGenerator.pause} />)

  return  (
    <div>
      <h1><b>Designing Sounds By Drawing Them</b></h1>
      <h3><i>Made by 3rd Year Imperial College Computing Students</i></h3>
      {inputGraph}
      <div/>
    </div>
  )
}
export default App;