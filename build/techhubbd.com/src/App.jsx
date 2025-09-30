import React from "react";
import HeadingHero from "./HeadingHero";
import HeadingContact from "./HeadingContact";

export default function App() {
	return (
		<div style={{ textAlign: "center", marginTop: "50px" }}>
			<HeadingHero />
			<hr />
			<HeadingContact />
		</div>
	);
}
