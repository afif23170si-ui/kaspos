import { Transaction } from '@/types/transaction';
import { createContext, useContext, useState } from 'react';

type AppContextType = {
    selectedTransaction: string;
    setSelectedTransaction: (value: string) => void;
    selectedTransactionId: string;
    setSelectedTransactionId: (value: string) => void;
    isOrderTypeOpen: boolean;
    setIsOrderTypeOpen: (value: boolean) => void;
    selectedOrderType: string;
    setSelectedOrderType: (value: string) => void;
    selectedTable: string;
    setSelectedTable: (value: string) => void;
    selectedPlatform: string;
    setSelectedPlatform: (value: string) => void;
    transaction: Transaction | null;
    setTransaction: (transaction: Transaction | null) => void;
    clearTransaction: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedTransaction, setSelectedTransaction] = useState('');
    const [selectedTransactionId, setSelectedTransactionId] = useState('');
    const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);
    const [selectedOrderType, setSelectedOrderType] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [transaction, setTransaction] = useState<Transaction | null>(null);

    const clearTransaction = () => {
        setTransaction(null);
    };

    return (
        <AppContext.Provider
            value={{
                selectedTransaction,
                setSelectedTransaction,
                selectedTransactionId,
                setSelectedTransactionId,
                isOrderTypeOpen,
                setIsOrderTypeOpen,
                selectedOrderType,
                setSelectedOrderType,
                selectedTable,
                setSelectedTable,
                selectedPlatform,
                setSelectedPlatform,
                transaction,
                setTransaction,
                clearTransaction,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
