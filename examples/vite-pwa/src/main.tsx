import React from "react";
import ReactDOM from "react-dom/client";

const App = () => (
  <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
    <h1>Orion Vite PWA</h1>
    <p>This progressive web app is orchestrated by Orion.</p>
  </main>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
