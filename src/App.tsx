import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';
import './App.css';

function Scene() {
  const { wireframe } = useControls({
    rotationSpeed: { value: 0.01, min: 0, max: 0.1, step: 0.001 },
    wireframe: false
  });

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />

      {/* Directional light for shadows and depth */}
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Placeholder mesh - this will become your globe/terrain */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='#2196f3' wireframe={wireframe} />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
      />

      {/* Performance stats */}
      <Stats />
    </>
  );
}

function App() {
  return (
    <div className='app'>
      <header className='header'>
        <h1>🌍 Earth Information Explorer</h1>
        <p>Interactive 3D geospatial dashboard</p>
      </header>

      <main className='main'>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Scene />
        </Canvas>
      </main>
    </div>
  );
}

export default App;
