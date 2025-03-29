import { useEffect, useState } from "react";
import { useBalance } from "../../context/BalanceContext";
import { useDemo } from "../../context/DemoContext"; // ← dodane
import styles from "./Balance.module.css";

const Balance = () => {
	const { balance, fetchBalance, updateBalance } = useBalance();
	const { demoBalance } = useDemo(); // ← dodane
	const isDemo =
		JSON.parse(localStorage.getItem("user"))?.email === "guest@demo.com"; // ← dodane

	const [input, setInput] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [initialBalance, setInitialBalance] = useState(null);
	const [showModal, setShowModal] = useState(
		localStorage.getItem("balanceConfirmed") !== "true"
	);

	useEffect(() => {
		if (!isDemo) {
			fetchBalance();
		}
	}, [fetchBalance, isDemo]);

	const handleSubmit = async () => {
		if (isNaN(input) || parseFloat(input) < 0) {
			return;
		}

		if (isDemo) {
			localStorage.setItem("balanceConfirmed", "true");
			setInitialBalance(input);
			setShowModal(false);
			return;
		}

		await updateBalance(parseFloat(input));
		localStorage.setItem("balanceConfirmed", "true");
		setShowModal(false);
	};

	return (
		<div className={styles.balance}>
			{showModal && (
				<div className={styles.overlay}>
					<div className={styles["modal-content"]}>
						<p>Please enter your balance to get started:</p>
						<input
							type="number"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Enter balance"
						/>
						<button onClick={handleSubmit}>Save</button>
					</div>
				</div>
			)}

			<div className={styles["balance-wrapper"]}>
				<p className={styles["balance-label"]}>Balance:</p>
				<div
					className={styles["balance-display"]}
					onClick={() => setIsEditing(true)}
				>
					{isEditing ? (
						<input
							type="number"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onBlur={() => setIsEditing(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSubmit();
									setIsEditing(false);
								}
							}}
						/>
					) : (
						<span>
							{isDemo
								? `${parseFloat(
										initialBalance ?? demoBalance
								  ).toFixed(2)} EUR`
								: `${parseFloat(balance).toFixed(2)} EUR`}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default Balance;
