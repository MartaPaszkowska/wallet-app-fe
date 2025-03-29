import Login from "../components/Login/Login";

const MainPage = ({ onLogin }) => {
	return (
		<div className="container">
			<Login onLogin={onLogin} />
		</div>
	);
};

export default MainPage;
