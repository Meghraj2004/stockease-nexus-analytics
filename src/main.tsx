
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "./styles/darkMode.css";
// Import jspdf and jspdf-autotable globally
import jsPDF from "jspdf";
import "jspdf-autotable";

// Fix for autoTable not being recognized
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
