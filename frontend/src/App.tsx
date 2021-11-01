import React, {ChangeEvent, useRef, useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import SoundGenerator from './SoundGenerator';
import PointFetcher from './PointFetcher';
import SoundGraph from './SoundGraph';

const kernels = {
  'Periodic': 'periodic',
  'Square Rational': 'sqrat',
}

function App() {
  const graphRef = useRef<SoundGraph>(null);
  const [soundGenerator] = useState<SoundGenerator>(new SoundGenerator());
  const [pointFetcher] = useState<PointFetcher>(new PointFetcher());
  const [parameter, setParameter] = useState(1);
  const [inputGraph] = useState(<SoundGraph
      ref={graphRef}
      soundGenFunc={soundGenerator.generateSound}
      resetSoundFunc={soundGenerator.resetSound}
      getDataFunc={pointFetcher.fetchData}
      kernel='periodic'
      minX={0}
      maxX={5}
      minY={20}
      maxY={100}
  />)

  const generateKernelDropdown: () => void = () => {
    const options = []
    for (let [label, value] of Object.entries(kernels)) {
      options.push(<option label={label} value={value}/>)
    }
    return <select onChange={(e) => {
      graphRef.current?.setState({kernel: e.target.value})
    }}>
      {options}
    </select>
  }

  const updateParameter: (event: ChangeEvent<HTMLInputElement>) => void = (event) => {
    setParameter(parseFloat(event.target.value))
  }

  return <div>
    {inputGraph}
    <button onClick={() => graphRef.current?.resetPoints()}>RESET</button>
    <button onClick={soundGenerator.playFromStart}>PLAY</button>
    <div/>
    <label> Parameter
      <input type="number" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
      <input type="range" min={0} max={10} step={0.5} value={parameter} onChange={updateParameter}/>
      {generateKernelDropdown()}
    </label>
  </div>
}
export default App;