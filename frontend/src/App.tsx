import React, {createRef, useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import {PointFetcher, SOCKET_CONNECTION } from './utils/PointFetcher';
import SoundGraph from './components/SoundGraph';

function App() {
  const graphRef = createRef<SoundGraph>();
  const [socketLoading, setSocketLoading] = useState<string>(SOCKET_CONNECTION.CONNECTING);
  const [pointFetcher] = useState<PointFetcher>(new PointFetcher(graphRef));
  const [inputGraph] = useState(<SoundGraph ref={graphRef} pointFetcher={pointFetcher} />)

  return  (
    <div>
      <h1><b>Designing Sounds By Drawing Them </b></h1>
      <h3><i>Made by 3rd Year Imperial College Computing Students</i></h3>
      <div className="socketStatus" style={{border: "2px solid black"}}>
        {socketLoading}
      </div>
      {inputGraph}
      <div/>
    </div>
  )
}
export default App;