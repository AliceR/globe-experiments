import { useCallback, useEffect, useState } from 'react';
/**
 * Custom hook to manage tabs with URL synchronization.
 * @param {Array} TABS - Array of tab objects with a 'key' property.
 * @returns {Array} - Returns the active tab and a function to set the active tab.
 */
export function useTabWithUrl(TABS: { key: string }[]) {
  const getTabFromUrl = useCallback((): string => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return TABS.some((t) => t.key === tab) && tab ? tab : TABS[0].key;
  }, [TABS]);

  const setTabInUrl = useCallback((tab: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TABS.some((t) => t.key === tab)) {
      return tab;
    } else {
      params.set('tab', TABS[0].key);
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${params.toString()}`
      );
      return TABS[0].key;
    }
  });

  useEffect(() => {
    const onPopState = () => setActiveTab(getTabFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [getTabFromUrl]);

  useEffect(() => {
    if (getTabFromUrl() !== activeTab) {
      setTabInUrl(activeTab);
    }
  }, [activeTab, getTabFromUrl, setTabInUrl]);

  return [activeTab, setActiveTab] as const;
}
