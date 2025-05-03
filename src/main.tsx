
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "./styles/darkMode.css";
// Import jspdf-autotable to ensure it's loaded globally
import "jspdf-autotable";

createRoot(document.getElementById("root")!).render(<App />);
