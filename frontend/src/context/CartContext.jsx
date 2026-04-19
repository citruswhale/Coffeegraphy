import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [storeId, setStoreId] = useState(null);

  const addItem = (item) => setItems((prev) => [...prev, { ...item, _key: Date.now() + Math.random() }]);
  const removeItem = (key) => setItems((prev) => prev.filter((i) => i._key !== key));
  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const pointsEarned = Math.floor(total * 10);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clear, total, pointsEarned, storeId, setStoreId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
