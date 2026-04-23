// App.tsx

import React from 'react';
import { MusicComposer } from './MusicComposer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Composition System</h1>
      </header>
      <MusicComposer />
    </div>
  );
};

export default App;