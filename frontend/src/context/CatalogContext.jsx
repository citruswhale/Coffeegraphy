import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    api.get("/catalog").then((r) => setCatalog(r.data)).catch(() => setCatalog(null));
  }, []);

  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
