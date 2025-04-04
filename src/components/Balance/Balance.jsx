import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useBalance } from "../../context/BalanceContext";
import { useDemo } from "../../context/DemoContext"; ////nowe
import "./Balance.css";
import { BalanceModal } from "../BalanceModal/BalanceModal";

const Balance = () => {
	const { balance, loading, updateBalance, calculateTransactionTotal } =
		useBalance();

	const { setDemoBalance, demoBalance } = useDemo(); ////nowe

	const user = JSON.parse(localStorage.getItem("user")); ////nowe
	const isDemo = user?.email === "guest@demo.com"; ////nowe

	const [input, setInput] = useState(balance || "0.00");
	const [isEditing, setIsEditing] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [initialBalance, setInitialBalance] = useState(balance || "0.00");

	useEffect(() => {
		const balanceConfirmed = localStorage.getItem("balanceConfirmed");
		const val = isDemo ? demoBalance : balance; ////nowe
		if (!loading && parseFloat(val) === 0 && balanceConfirmed !== "true") {
			setShowModal(true);
		} else {
			setShowModal(false);
		}
	}, [balance, demoBalance, loading]); ////zmieniono zależności

	const handleChange = (e) => {
		const inputValue = e.target.value.replace(" EUR", "");
		if (/^\d*\.?\d*$/.test(inputValue) || inputValue === "") {
			setInput(inputValue);
		}
	};

	const handleFocus = () => {
		setInput(initialBalance);
		setIsEditing(true);
	};

	const handleBlur = () => {
		if (!isEditing) return;
		if (!input || input === "") {
			setInput(isDemo ? demoBalance : balance); ////nowe
		}
		setIsEditing(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newInitialBalance = parseFloat(input);

		if (isNaN(newInitialBalance) || newInitialBalance < 0) {
			toast.error("Please enter a valid balance!", {
				autoClose: 2000,
				theme: "colored",
			});
			return;
		}

		try {
			if (isDemo) {
				setDemoBalance(newInitialBalance); ////nowe
				setInitialBalance(newInitialBalance); ////nowe
				localStorage.setItem("balanceConfirmed", "true"); ////nowe
				setShowModal(false); ////nowe
				document.activeElement.blur(); ////nowe
				return; ////nowe
			}

			const totalTransactions = await calculateTransactionTotal();
			const updatedBalance = newInitialBalance + totalTransactions;

			await updateBalance(updatedBalance);
			setInitialBalance(newInitialBalance);
			localStorage.setItem("balanceConfirmed", "true");
			setShowModal(false);
			document.activeElement.blur();
		} catch (error) {
			console.error("Error updating balance:", error.message);
		}
	};

	return (
		<div className="balance__container">
			<form onSubmit={handleSubmit} className="balance__form">
				<label className="balance__label" htmlFor="balance">
					Balance:
				</label>
				<div className="balance__input-container">
					{showModal && <BalanceModal />}
					<div className="balance__input_wrapper">
						{loading ? (
							<div className="balance__spinner"></div>
						) : (
							<input
								className="balance__input"
								id="balance"
								type="text"
								value={
									isEditing
										? input
										: `${parseFloat(
												isDemo ? demoBalance : balance ////nowe
										  ).toFixed(2)} EUR`
								}
								onChange={handleChange}
								onFocus={handleFocus}
								onBlur={handleBlur}
								placeholder="00.00 EUR"
							/>
						)}
					</div>
					<button
						type="submit"
						className={`button-balance ${
							input ? "buttonActive-balance" : ""
						}`}
					>
						CONFIRM
					</button>
				</div>
			</form>
		</div>
	);
};

export default Balance;
