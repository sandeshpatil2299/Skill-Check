import React from 'react'

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className='w-full'>
            {/* Tab Navigation */}
            <div className="relative border-b-2 border-slate-200">
                <nav className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => ( // ✅ Fixed: Added return by using parentheses
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`
                                relative pb-4 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap
                                ${activeTab === tab.name
                                    ? 'text-blue-600' // ✅ Changed to blue to match app theme
                                    : 'text-slate-600 hover:text-slate-900'
                                }
                            `}
                        >
                            <span>{tab.label}</span>

                            {/* Active Tab Indicator */}
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {tabs.map((tab) => {
                    if (tab.name === activeTab) {
                        return (
                            <div key={tab.name} className="min-h-[400px]">
                                {typeof tab.content === 'function' ? tab.content() : tab.content} {/* ✅ Handle both function and direct content */}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default Tabs;