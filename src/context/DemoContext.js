import { createContext, useContext, useState } from "react";

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
	const [demoTransactions, setDemoTransactions] = useState([]);
	const [demoBalance, setDemoBalance] = useState(0);

	const addTransaction = (transaction) => {
		setDemoTransactions((prev) => [...prev, transaction]);

		if (transaction.type === "income") {
			setDemoBalance((prev) => prev + transaction.amount);
		} else if (transaction.type === "expense") {
			setDemoBalance((prev) => prev - transaction.amount);
		}
	};

	return (
		<DemoContext.Provider
			value={{
				demoTransactions,
				demoBalance,
				addTransaction,
			}}
		>
			{children}
		</DemoContext.Provider>
	);
};

export const useDemo = () => useContext(DemoContext);
