import React from 'react'

const PageHeader = ({ title, subtitle, children }) => {
    return (
        <div className='flex items-center justify-between mb-8'> {/* ✅ Fixed: justify-between instead of justify-center */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 text-sm">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex-shrink-0"> {/* ✅ Added flex-shrink-0 */}
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;