import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Balance from "../Balance/Balance";
import "./topReport.css";

const TopReports = () => {
	const [date, setDate] = useState(new Date());
	const navigate = useNavigate();
	const [isHidden, setIsHidden] = useState(window.innerWidth < 600);

	useEffect(() => {
		// Update the URL with the new month (format YYYY-MM) whenever date changes
		const formattedMonth = date.toISOString().slice(0, 7);
		navigate(`/reports/${formattedMonth}`);
	}, [date, navigate]);

	useEffect(() => {
		// Show/hide the "Main page" text based on window width (responsive design)
		const handleResize = () => {
			setIsHidden(window.innerWidth < 600);
		};
		window.addEventListener("resize", handleResize);
		handleResize(); // set initial state based on current width
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const changeMonth = (offset) => {
		setDate((prevDate) => {
			const newDate = new Date(prevDate);
			newDate.setMonth(prevDate.getMonth() + offset);
			return newDate;
		});
	};

	const formatDate = () => {
		const monthName = date.toLocaleString("en-US", { month: "long" });
		const year = date.getFullYear();
		return `${monthName} ${year}`;
	};

	return (
		<div className="reports-header">
			{/* Link to go back to main page/home */}
			<Link to="/" className="reports-header__home-link">
				<svg width="24" height="24" aria-hidden="true">
					<use href="/sprite.svg#back-arrow"></use>
				</svg>
				<p
					className={
						isHidden
							? "reports-header__home-link-text reports-header__home-link-text--visually-hidden"
							: "reports-header__home-link-text"
					}
				>
					Main page
				</p>
			</Link>

			<div className="reports-header__balance-and-month-selector-container">
				{/* Display current balance (handles demo vs normal internally) */}
				<Balance />

				{/* Month selector controls */}
				<div className="reports-header__month-selector-container">
					<p className="reports-header__month-selector-text">
						Current period:
					</p>
					<div className="reports-header__month-selector">
						<button
							className="reports-header__prev-month-btn"
							onClick={() => changeMonth(-1)}
							aria-label="Previous Month"
						>
							<svg width="9" height="12" aria-hidden="true">
								<use href="/sprite.svg#prev"></use>
							</svg>
						</button>
						<p className="reports-header__current-date">
							{formatDate()}
						</p>
						<button
							className="reports-header__next-month-btn"
							onClick={() => changeMonth(1)}
							aria-label="Next Month"
						>
							<svg width="9" height="12" aria-hidden="true">
								<use href="/sprite.svg#next"></use>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopReports;
