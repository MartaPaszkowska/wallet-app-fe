<button
	className="login__guest-btn"
	type="button"
	onClick={() => {
		localStorage.setItem("token", "guest-token");
		localStorage.setItem(
			"user",
			JSON.stringify({ email: "guest@demo.com" })
		);
		onLogin("guest@demo.com"); // ⬅️ TO JEST KLUCZOWE
		navigate("/home");
	}}
>
	Try My!
</button>;
