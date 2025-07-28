export function Tabs({
  tabs: TABS,
  activeTab,
  setActiveTab
}: {
  tabs: { key: string; label: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <nav className='flex border-b border-white/10 px-8 py-2'>
      <div className='flex space-x-4' role='tablist'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`relative inline-flex items-center border-r-0 px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'border-b-2 border-transparent text-white/70 hover:border-blue-300 hover:text-blue-300'
            } `}
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            type='button'
            role='tab'
            tabIndex={activeTab === tab.key ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const idx = TABS.findIndex((t) => t.key === activeTab);
                const nextIdx =
                  e.key === 'ArrowRight'
                    ? (idx + 1) % TABS.length
                    : (idx - 1 + TABS.length) % TABS.length;
                setActiveTab(TABS[nextIdx].key);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
