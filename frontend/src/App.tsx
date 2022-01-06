import React, {useState} from 'react';
import './App.css';
import './SASSStyles.scss';
import SoundGraph from './components/SoundGraph';

function App() {
  const [inputGraph] = useState(<SoundGraph />)

  return  (
    <div>
      {inputGraph}
    </div>
  )
}
export default App;