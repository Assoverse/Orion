import React from "react";
import ReactDOM from "react-dom/client";

const App = () => (
  <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
    <h1>Orion Vite + React</h1>
    <p>This Vite application is orchestrated by Orion.</p>
  </main>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
