// src/context/DataCacheContext.js
import React, { createContext, useContext, useRef } from "react";

const DataCacheContext = createContext();

export const DataCacheProvider = ({ children }) => {
  const cache = useRef({});
  return (
    <DataCacheContext.Provider value={cache.current}>
      {children}
    </DataCacheContext.Provider>
  );
};

export const useDataCache = () => useContext(DataCacheContext);
