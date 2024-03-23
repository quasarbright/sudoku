import React, {useState} from 'react';
import './App.css';
import {Grid} from "./model";
import {GridView} from "./components/grid";

function App() {
  const [initialGrid, setInitialGrid] = useState(Grid.generateUnsolved(17))
  return (
      <div style={{padding: 10}}>
        <h1>Sudoku</h1>
        <div>
          <button onClick={() => setInitialGrid(Grid.generateUnsolved(17))}>New Game</button>
        </div>
        <br/>
        {/*supply key to reset state on new game*/}
        <GridView key={JSON.stringify(initialGrid)} initialGrid={initialGrid}/>
      </div>
  );
}

export default App;
