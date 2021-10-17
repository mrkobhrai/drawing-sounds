import React, {createRef} from 'react';
import './App.css';
import InputGraph from "./InputGraph";

function App() {
  let ref = createRef<InputGraph>();
  const inputGraph = <InputGraph ref={ref}/>

  return <div>
    {inputGraph}
    <button onClick={() => ref.current?.resetPoints()}>RESET</button>
  </div>
}

export default App;
