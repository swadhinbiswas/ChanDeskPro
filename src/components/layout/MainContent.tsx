import { useMemo } from 'react';
import { useTabStore } from '../../stores/tabStore';
import CatalogView from '../board/CatalogView';
import ThreadView from '../thread/ThreadView';
import { Home } from 'lucide-react';

export default function MainContent() {
    const tabs = useTabStore((state) => state.tabs);
    const activeTabId = useTabStore((state) => state.activeTabId);

    const activeTab = useMemo(() => {
        return tabs.find((tab) => tab.id === activeTabId);
    }, [tabs, activeTabId]);

    if (!activeTab) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg text-gray-400">
                <Home className="w-16 h-16 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Welcome to ChanDesk</h2>
                <p className="text-sm">Select a board from the sidebar to get started</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden bg-dark-bg">
            {activeTab.type === 'catalog' && activeTab.board && (
                <CatalogView board={activeTab.board} />
            )}

            {activeTab.type === 'thread' && activeTab.board && activeTab.threadId && (
                <ThreadView board={activeTab.board} threadId={activeTab.threadId} />
            )}
        </div>
    );
}
