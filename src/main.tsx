import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* Newspaper DNA: paper, ink, type, room */
import "./styles/newsprint.css";
/* Flip book, pages, opening sequence, reader overlay */
import "./styles/pages.css";
/* Miranda Award-Winning Editorial Design System */
import "./styles/miranda.css";
/* Finite 3D Broadsheet Design System */
import "./styles/finite.css";
/* Web fonts */
import "./styles/fonts.css";
/* Botpress AI Inky Newspaper Theme & Pop-up */
import "./styles/botpress-newspaper.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
