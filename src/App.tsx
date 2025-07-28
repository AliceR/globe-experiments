import R3FGlobe from './r3f';
import DeckGLGlobe from './deckgl';

import { Tabs, useTabWithUrl } from './components/tabs';

const TABS = [
  { key: 'r3f', label: 'R3F Globe' },
  { key: 'deckgl', label: 'DeckGL Globe' }
];

function App() {
  const [activeTab, setActiveTab] = useTabWithUrl(TABS);

  return (
    <div className='flex h-full flex-col bg-gradient-to-br from-black to-[#1a1a2e] font-sans text-white'>
      <header className='fixed top-0 right-0 left-0 z-50 bg-black/80 px-8 py-4 backdrop-blur-md'>
        <h1 className='m-0 bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-[1.5rem] font-semibold text-transparent'>
          Earth Information Explorer
        </h1>
      </header>
      <main className='flex h-screen w-screen flex-col overflow-hidden pt-[110px]'>
        <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <section className='flex flex-1 overflow-hidden'>
          {activeTab === 'r3f' && (
            <div id='tabpanel-r3f' className='relative isolate h-full flex-1'>
              <R3FGlobe />
            </div>
          )}
          {activeTab === 'deckgl' && (
            <div
              id='tabpanel-deckgl'
              className='relative isolate h-full flex-1'
            >
              <DeckGLGlobe />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
