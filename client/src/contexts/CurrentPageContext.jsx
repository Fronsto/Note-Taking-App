import React, { useContext, useState } from 'react';
const CurrentPageContext = React.createContext();

export const useCPage = () => useContext(CurrentPageContext);
export function CurrentPageProvider({ children }) {
    const [currentPage, setCurrentPage] = useState(null);
    const value = {
        currentPage,
        setCurrentPage,
    };

    return (
        <CurrentPageContext.Provider value={value}>
            {children}
        </CurrentPageContext.Provider>
    );
}
