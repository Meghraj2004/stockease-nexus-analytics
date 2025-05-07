
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "./styles/darkMode.css";
// Import jspdf and jspdf-autotable globally
import jsPDF from "jspdf";
import "jspdf-autotable";

// Remove the conflicting declaration since it's already defined in invoiceService.ts
// This was causing the TypeScript error

createRoot(document.getElementById("root")!).render(<App />);
