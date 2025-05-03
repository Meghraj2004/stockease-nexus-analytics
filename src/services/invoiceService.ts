
import jsPDF from "jspdf";
import { formatToRupees } from "@/types/inventory";

// Ensure TypeScript recognizes the autoTable method on jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
  lastAutoTable: {
    finalY: number;
  };
}

export const generateInvoicePDF = (saleData: any) => {
  try {
    console.log("Generating invoice with data:", saleData);
    
    // Create a new jsPDF instance
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Add company header
    doc.setFontSize(20);
    doc.text("Your Company Name", 14, 22);
    
    doc.setFontSize(10);
    doc.text("Address: 123 Business Street, City, Country", 14, 28);
    doc.text("Phone: +91 1234567890", 14, 33);
    doc.text("Email: contact@yourcompany.com", 14, 38);
    
    // Invoice details
    doc.setFontSize(15);
    doc.text("INVOICE", 170, 20, { align: "right" });
    doc.setFontSize(10);
    doc.text(`Invoice #: ${saleData.id.slice(0, 8)}`, 170, 28, { align: "right" });
    doc.text(`Date: ${new Date(saleData.timestamp).toLocaleDateString()}`, 170, 33, { align: "right" });
    doc.text(`Time: ${new Date(saleData.timestamp).toLocaleTimeString()}`, 170, 38, { align: "right" });
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);
    
    // Customer info
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 50);
    doc.setFontSize(10);
    doc.text(saleData.customerName || "Walk-in Customer", 14, 55);
    
    // Item table header
    doc.setFontSize(12);
    doc.text("Invoice Items:", 14, 65);
    
    // Prepare table data
    const tableColumn = ["Item", "Price", "Qty", "Total"];
    const tableRows = saleData.items.map((item: any) => [
      item.name,
      formatToRupees(item.price),
      item.quantity,
      formatToRupees(item.price * item.quantity)
    ]);
    
    // Generate the table with better styling
    doc.autoTable({
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto', halign: 'right' },
        2: { cellWidth: 'auto', halign: 'center' },
        3: { cellWidth: 'auto', halign: 'right' }
      }
    });
    
    // Get the final Y position after the table is drawn
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Summary
    doc.setFontSize(10);
    doc.text("Subtotal:", 140, finalY);
    doc.text(`${formatToRupees(saleData.subtotal)}`, 190, finalY, { align: "right" });
    
    doc.text(`Discount (${saleData.discount}%):`, 140, finalY + 5);
    doc.text(`${formatToRupees(saleData.discountAmount)}`, 190, finalY + 5, { align: "right" });
    
    doc.text(`GST (${saleData.vatRate}%):`, 140, finalY + 10);
    doc.text(`${formatToRupees(saleData.vatAmount)}`, 190, finalY + 10, { align: "right" });
    
    // Add a line before the total
    doc.setLineWidth(0.5);
    doc.line(140, finalY + 13, 190, finalY + 13);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", 140, finalY + 20);
    doc.text(`${formatToRupees(saleData.total)}`, 190, finalY + 20, { align: "right" });
    
    // Add a line separator before footer
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 30, 196, finalY + 30);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Payment Terms: Due on receipt", 14, finalY + 40);
    doc.text("Thank you for your business!", 14, finalY + 45);
    
    // Save PDF
    doc.save(`invoice-${saleData.id.slice(0, 8)}.pdf`);
    
    console.log("PDF successfully generated and saved");
    return true;
  } catch (error) {
    console.error("Error in invoice service while generating PDF:", error);
    return false;
  }
};
