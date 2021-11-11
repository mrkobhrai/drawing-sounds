import React, {useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import PointFetcher from './utils/PointFetcher';
import SoundGraph from './components/SoundGraph';

function App() {
  const [pointFetcher] = useState<PointFetcher>(new PointFetcher());
  const [inputGraph] = useState(<SoundGraph getDataFunc={pointFetcher.fetchData} />)

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