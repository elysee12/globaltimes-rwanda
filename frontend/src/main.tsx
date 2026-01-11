import { createRoot } from "react-dom/client";
import { NewsProvider } from "./contexts/NewsContext";
import App from "./App.tsx";
import "./index.css";
import logo from "./assets/Logo.jpg";

// Set favicon dynamically
const setFavicon = (url: string) => {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.href = url;
  
  // Also set apple-touch-icon
  let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
  if (!appleLink) {
    appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    document.getElementsByTagName("head")[0].appendChild(appleLink);
  }
  appleLink.href = url;
};

setFavicon(logo);

createRoot(document.getElementById("root")!).render(
  <NewsProvider>
    <App />
  </NewsProvider>
);
