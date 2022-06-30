import React, { useState } from 'react';
import { AccountSettings, PreferencesSettings, AboutSection } from './Contents';

const Tabs = [
    { element: AccountSettings, label: 'My Account', index: 1 },
    { element: AboutSection, label: 'About', index: 2 },
];

const SettingsModal = ({ modalOpen }) => {
    const [selectedTab, setSelectedTab] = useState(modalOpen);
    const tabClick = (index) => {
        setSelectedTab(index);
    };
    return (
        <>
            <TabSidebar
                selectedTab={selectedTab}
                onClick={tabClick}
                Tabs={Tabs}
            />
            <TabContent selectedTab={selectedTab} Tabs={Tabs} />
        </>
    );
};

const TabSidebar = ({ Tabs, selectedTab, onClick }) => {
    return (
        <div className="settings-sidebar">
            {Tabs.map((tab) => (
                <div
                    key={tab.index}
                    className={`settings-tab ${
                        selectedTab === tab.index ? 'selected-tab' : ''
                    }`}
                    onClick={() => onClick(tab.index)}
                >
                    <p>{tab.label}</p>
                    {selectedTab === tab.index ? (
                        <div className="underline-highlight" />
                    ) : null}
                </div>
            ))}
        </div>
    );
};

const TabContent = ({ Tabs, selectedTab }) => {
    return (
        <div className="settings-content">
            {Tabs.map((tab) => {
                if (tab.index !== selectedTab) return undefined;
                return <tab.element key={tab.index} />;
            })}
        </div>
    );
};

export default SettingsModal;
