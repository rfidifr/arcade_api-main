import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Initial Mock Data (Empty for production)
const INITIAL_INVENTORY = [];
const INITIAL_TRANSACTIONS = [];
const INITIAL_MACHINES = [];
const INITIAL_LOGS = [];
const INITIAL_NOTIFICATIONS = [];

// Helper to get from local storage or default
const getStoredState = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    
    // Check if the data contains any mock set (completely purge if ANY mock ID found)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const mockIds = ['CARD-8832', 'CARD-9941', 'M-001', 'TX-1001'];
      const hasMock = parsed.some(item => 
        (item.id && mockIds.includes(item.id)) || 
        (item.cardId && mockIds.includes(item.cardId))
      );
      if (hasMock) {
        console.log(`Purging mock data from ${key}`);
        localStorage.removeItem(key);
        return defaultValue;
      }
    }
    return parsed;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const AppProvider = ({ children }) => {
  // Initialize state from LocalStorage
  const [inventory, setInventory] = useState(() => getStoredState('inventory', INITIAL_INVENTORY));
  const [transactions, setTransactions] = useState(() => getStoredState('transactions', INITIAL_TRANSACTIONS));

  const [notifications, setNotifications] = useState(() => getStoredState('notifications', INITIAL_NOTIFICATIONS));

  const addNotification = (type, message) => {
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };
  const [machines, setMachines] = useState(() => getStoredState('machines', INITIAL_MACHINES));
  const [logs, setLogs] = useState(() => getStoredState('logs', INITIAL_LOGS));
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [undoData, setUndoData] = useState(null);

  // Fetch machines from backend
  const fetchMachines = async () => {
    try {
      const response = await api.get('/manager/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    }
  };

  // Fetch cards from backend
  const fetchCards = async () => {
    try {
      const response = await api.get('/manager/cards');
      if (response.data) {
        setInventory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  };

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const response = await api.get('/manager/logs');
      if (response.data) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/manager/transactions');
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    if (user && user.access_token) {
      fetchMachines();
      fetchCards();
      fetchLogs();
      fetchTransactions();
    }
  }, [user]);

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('machines', JSON.stringify(machines)), [machines]);
  useEffect(() => localStorage.setItem('logs', JSON.stringify(logs)), [logs]);

  // --- Cross-Tab Synchronization ---
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'inventory') setInventory(JSON.parse(e.newValue));
      if (e.key === 'transactions') setTransactions(JSON.parse(e.newValue));
      if (e.key === 'machines') setMachines(JSON.parse(e.newValue));
      if (e.key === 'logs') setLogs(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Actions ---

  const bulkDeleteCards = (ids) => {
    setInventory(prev => prev.filter(c => !ids.includes(c.id)));
    addLog('WARNING', `Bulk deleted ${ids.length} cards: ${ids.join(', ')}`, 'Inventory');
  };

  const bulkBlockCards = (ids) => {
    setInventory(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'BLOCKED' } : c));
    addLog('WARNING', `Bulk blocked ${ids.length} cards`, 'Inventory');
  };

  const bulkRechargeCards = (ids, amount) => {
    setInventory(prev => prev.map(c => ids.includes(c.id) ? { ...c, balance: c.balance + amount } : c));
    addLog('INFO', `Bulk recharged ${ids.length} cards with ${amount} tokens`, 'Inventory');
  };

  const replaceCard = (oldCardId, newCardId) => {
    const oldCard = inventory.find(c => c.id === oldCardId);
    if (!oldCard) return { success: false, message: 'Old card not found' };

    const existingNewCard = inventory.find(c => c.id === newCardId);
    if (existingNewCard && existingNewCard.balance > 0) {
       return { success: false, message: 'Target card is already in use (has balance)' };
    }

    const balanceToTransfer = oldCard.balance;
    const ticketsToTransfer = oldCard.tickets || 0;

    // 1. Block Old Card & Zero out
    const updatedOldCard = { 
      ...oldCard, 
      status: 'BLOCKED', 
      balance: 0, 
      tickets: 0,
      issuedTo: `${oldCard.issuedTo} (Replaced by ${newCardId})` 
    };

    // 2. Create/Update New Card
    const cardToAddOrUpdate = {
      id: newCardId,
      balance: balanceToTransfer,
      tickets: ticketsToTransfer,
      status: 'ACTIVE',
      lastUsed: 'Just now',
      issuedTo: oldCard.issuedTo,
      phoneNumber: oldCard.phoneNumber
    };

    setInventory(prev => {
      const filtered = prev.filter(c => c.id !== oldCardId && c.id !== newCardId);
      return [cardToAddOrUpdate, updatedOldCard, ...filtered];
    });

    addLog('WARNING', `REPLACEMENT: ${oldCardId} -> ${newCardId}. Transferred ${balanceToTransfer} tokens.`, 'Card Ops');
    return { success: true };
  };

  const performUndo = () => {
    if (!undoData) return;
    
    const { type, restoreData } = undoData;
    
    if (type === 'DELETE_CARD') {
      setInventory(prev => [restoreData, ...prev]);
      addLog('INFO', `Undo: Restored card ${restoreData.id}`, 'System');
    } else if (type === 'BLOCK_CARD') {
       setInventory(prev => prev.map(c => c.id === restoreData.id ? { ...c, status: restoreData.status } : c));
       addLog('INFO', `Undo: Reverted block status for card ${restoreData.id}`, 'System');
    } else if (type === 'REFUND_CARD') {
        setInventory(prev => prev.map(c => c.id === restoreData.id ? { ...c, balance: restoreData.balance } : c));
        addLog('INFO', `Undo: Reverted refund for card ${restoreData.id}`, 'System');
    } else if (type === 'DELETE_MACHINE') {
        setMachines(prev => [...prev, restoreData]);
        addLog('INFO', `Undo: Restored machine ${restoreData.name}`, 'System');
    }

    if (undoData.timeoutId) clearTimeout(undoData.timeoutId);
    setUndoData(null);
  };

  const registerUndo = (type, restoreData) => {
    if (undoData && undoData.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => setUndoData(null), 20000);
    setUndoData({ type, restoreData, timeoutId });
  };

  const addLog = (type, message, source = 'System') => {
    const operator = user?.username || 'System';
    const newLog = {
      id: Date.now(),
      type, // INFO, WARNING, ERROR, SUCCESS
      message,
      time: new Date().toLocaleTimeString(),
      source,
      operator
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/token', formData);
      const { access_token } = response.data;
      
      // We'll set a temporary user to trigger the fetch calls
      const userData = { 
        username, 
        access_token,
        role: username === 'admin' ? 'admin' : 'manager' 
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      addLog('INFO', `User ${username} logged in successfully`, 'Auth');
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      addLog('ERROR', `Login failed: ${error.response?.data?.detail || 'Server error'}`, 'Auth');
      return false;
    }
  };

  const logout = () => {
    addLog('INFO', `User ${user?.username} logged out`, 'Auth');
    setUser(null);
    localStorage.removeItem('user');
  };

  const addCard = async (cardData) => {
    try {
      // Backend expects: card_id, owner_name, contact_no
      const payload = {
        card_id: cardData.id,
        owner_name: cardData.issuedTo || 'Guest',
        contact_no: cardData.phoneNumber || '0000000000'
      };
      const response = await api.post('/manager/create-card', payload);
      if (response.status === 200) {
        await fetchCards();
        await fetchLogs();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to add card:', error);
      addLog('ERROR', `Failed to register card ${cardData.id}`, 'Inventory');
      return { success: false, message: error.response?.data?.detail || 'Registration failed' };
    }
  };
  
  const updateCard = async (updatedCard) => {
    // For now, we only have recharge and refund endpoints in backend
    // If balance changed, use recharge
    const oldCard = inventory.find(c => c.id === updatedCard.id);
    if (oldCard && updatedCard.balance > oldCard.balance) {
      try {
        const amount = updatedCard.balance - oldCard.balance;
        await api.put('/manager/recharge', { card_id: updatedCard.id, amount });
        await fetchCards();
        await fetchTransactions();
        await fetchLogs();
        addLog('SUCCESS', `Recharged card ${updatedCard.id} with ${amount} tokens`, 'Inventory');
        return { success: true };
      } catch (error) {
        console.error('Recharge failed:', error);
        const errorMsg = error.response?.data?.detail || 'Recharge failed';
        addLog('ERROR', `Recharge failed for card ${updatedCard.id}: ${errorMsg}`, 'Inventory');
        return { success: false, message: errorMsg };
      }
    }
    
    // If balance decreased, it's a deduction/refund
    if (oldCard && updatedCard.balance < oldCard.balance) {
      try {
        // We don't have a partial refund endpoint, only a full refund one.
        // Let's implement a general deduction if possible, or use full refund.
        // For now, if it's a reduction, we might need a separate endpoint or 
        // handle it as a negative recharge if backend allows (unlikely with schemas).
        
        // If the goal is a full refund (balance becomes 0)
        if (updatedCard.balance === 0) {
          return await refundCard(updatedCard.id);
        }
        
        // For partial deduction, we might need a new endpoint. 
        // For now, let's just update locally and log it.
        setInventory(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        addLog('INFO', `Updated card ${updatedCard.id} (Local update)`, 'Inventory');
        return { success: true };
      } catch (error) {
        console.error('Update failed:', error);
        return { success: false, message: 'Update failed' };
      }
    }

    // If status or other things changed
    setInventory(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    return { success: true };
  };

  const deleteCard = (id) => {
    const card = inventory.find(c => c.id === id);
    if (card) {
      registerUndo('DELETE_CARD', card);
      setInventory(prev => prev.filter(c => c.id !== id));
      addLog('WARNING', `Card ${id} deleted from system`, 'Inventory');
    }
  };

  const blockCard = (id) => {
    const card = inventory.find(c => c.id === id);
    if (card) {
      registerUndo('BLOCK_CARD', { id, status: card.status });
      updateCard({ ...card, status: 'BLOCKED' });
    }
  };

  const refundCard = async (id) => {
    try {
      await api.put('/manager/refund', { card_id: id });
      await fetchCards();
      await fetchTransactions();
      await fetchLogs();
      return { success: true };
    } catch (error) {
      console.error('Refund failed:', error);
      addLog('ERROR', `Refund failed for card ${id}`, 'Inventory');
      return { success: false };
    }
  };

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
    // addLog('INFO', `Transaction ${tx.id}: ${tx.type} ${tx.amount} on ${tx.terminal}`, 'Transactions');
  };

  const updateMachine = (updatedMachine) => {
    setMachines(prev => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
    addLog('INFO', `Machine ${updatedMachine.name} updated`, 'Machines');
  };

  const addMachine = (machine) => {
    setMachines(prev => [...prev, machine]);
    addLog('SUCCESS', `New machine added: ${machine.name}`, 'Machines');
  };

  const deleteMachine = (id) => {
    const machine = machines.find(m => m.id === id);
    if (machine) {
      // registerUndo('DELETE_MACHINE', machine); // Not explicitly requested for machines, but good to have? 
      // User said "actions like card deletion, blocking and refund to have a undo option". 
      // Didn't say machine deletion. But "Employee can not delete...". 
      // Admin can. I'll leave it simple or add if needed. 
      // Let's stick to card actions as requested.
      setMachines(prev => prev.filter(m => m.id !== id));
      addLog('WARNING', `Machine ${id} removed`, 'Machines');
    }
  };

  return (
    <AppContext.Provider value={{
      inventory,
      transactions,
      machines,
      logs,
      undoData, // Export undo state
      performUndo, // Export undo function
      notifications,
      addNotification,
      blockCard,
      refundCard,
      addCard,
      updateCard,
      deleteCard,
      addTransaction,
      updateMachine,
      addMachine,
      deleteMachine,
      bulkDeleteCards,
      bulkBlockCards,
      bulkRechargeCards,
      replaceCard,
      addLog,
      user,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
