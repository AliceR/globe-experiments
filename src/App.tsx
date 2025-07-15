import { Canvas } from '@react-three/fiber';

import './App.css';
import Scene from './Scene';

function App() {
  return (
    <div className='app'>
      <header className='header'>
        <h1>🌍 Earth Information Explorer</h1>
        <p>Interactive 3D geospatial dashboard</p>
      </header>

      <main className='main'>
        <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
          <Scene />
        </Canvas>
      </main>
    </div>
  );
}

export default App;
