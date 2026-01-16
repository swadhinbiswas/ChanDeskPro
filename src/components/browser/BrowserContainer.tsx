/**
 * Browser Container
 * 
 * Full-screen container for the in-app browser.
 * Overlays the main app when browser tabs are visible.
 */

import BrowserTabBar from './BrowserTabBar';
import BrowserView from './BrowserView';
import { useBrowserTabsStore } from '../../stores/browserTabsStore';

export default function BrowserContainer() {
    const { isVisible, tabs } = useBrowserTabsStore();

    if (!isVisible || tabs.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-dark-bg">
            <BrowserTabBar />
            <BrowserView />
        </div>
    );
}
