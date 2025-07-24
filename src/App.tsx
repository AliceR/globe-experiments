import R3FGlobe from './r3f';

function App() {
  return (
    <div className='flex h-full flex-col bg-gradient-to-br from-black to-[#1a1a2e] font-sans text-white'>
      <header className='fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/80 px-8 py-4 backdrop-blur-md'>
        <h1 className='m-0 bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-[1.5rem] font-semibold text-transparent'>
          🌍 Earth Information Explorer
        </h1>
        <p className='mt-1 mb-0 text-[0.9rem] text-white/70'>
          Interactive 3D geospatial dashboard
        </p>
      </header>
      <main className='relative min-h-0 flex-1'>
        <R3FGlobe />
      </main>
    </div>
  );
}

export default App;
