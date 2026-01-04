import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "jotai";
import { store } from "./store.ts";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <App></App>
    </Provider>
);
