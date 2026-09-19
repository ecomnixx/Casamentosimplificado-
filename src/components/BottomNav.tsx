import React from 'react';
import { Home, ClipboardList, Users, Globe, MoreHorizontal } from 'lucide-react';
import { ColorPalette } from '../types';

export type TabType = 'home' | 'plan' | 'guests' | 'site' | 'more' | 'suppliers' | 'budget' | 'checklist' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  palette: ColorPalette;
  isAdmin?: boolean;
  pendingAccessCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  palette,
  isAdmin,
  pendingAccessCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Início', icon: Home },
    { id: 'plan' as TabType, label: 'Planejar', icon: ClipboardList },
    { id: 'guests' as TabType, label: 'Convidados', icon: Users },
    { id: 'site' as TabType, label: 'Site', icon: Globe },
    { id: 'more' as TabType, label: 'Mais', icon: MoreHorizontal },
  ];

  const isTabActive = (tabId: TabType) => {
    if (tabId === 'home') return activeTab === 'home';
    if (tabId === 'plan') {
      return (
        activeTab === 'plan' ||
        activeTab === 'suppliers' ||
        activeTab === 'budget' ||
        activeTab === 'checklist'
      );
    }
    if (tabId === 'guests') return activeTab === 'guests';
    if (tabId === 'site') return activeTab === 'site';
    if (tabId === 'more') return activeTab === 'more' || activeTab === 'admin';
    return false;
  };

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/98 backdrop-blur-md border-t border-stone-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-300"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.id);

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-1 relative transition-all duration-150 active:scale-95 select-none"
            style={{
              color: active ? palette.primaryDark : '#8E8E93',
            }}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                className="w-5 h-5 transition-transform"
                style={{
                  color: active ? palette.primaryDark : '#8E8E93',
                  strokeWidth: active ? 2.4 : 1.8,
                }}
              />
              {tab.id === 'more' && isAdmin && pendingAccessCount > 0 && (
                <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs animate-pulse">
                  {pendingAccessCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight ${
                active ? 'font-semibold text-stone-900' : 'font-normal text-stone-500'
              }`}
            >
              {tab.label}
            </span>
            {/* The signature active dot indicator from the screenshots */}
            {active && (
              <span
                className="w-1 h-1 rounded-full mt-0.5 transition-all"
                style={{ backgroundColor: palette.primaryDark }}
              />
            )}
            {!active && <span className="w-1 h-1 mt-0.5 opacity-0" />}
          </button>
        );
      })}
    </nav>
  );
};
