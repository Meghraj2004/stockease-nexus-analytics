
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatToRupees } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

// Define a proper type for jsPDF with autoTable
interface TableColumn {
  header?: string;
  dataKey?: string;
}

// Properly define the extended jsPDF type with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: any[][];
      body: any[][];
      theme?: string;
      styles?: any;
      headStyles?: any;
      alternateRowStyles?: any;
      columnStyles?: any;
      margin?: any;
      tableWidth?: any;
    }) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Constants for branding
const COMPANY_NAME = "ShopSmart POS";
const COMPANY_TAGLINE = "Smart Solutions for Smart Businesses";
const COMPANY_ADDRESS = "123 Business Street, City, Country";
const COMPANY_PHONE = "+91 9421612110";
const COMPANY_EMAIL = "contact@shopsmartpos.com";
const COMPANY_WEBSITE = "www.shopsmartpos.com";

// Helper function to download the PDF using browser's built-in functionality
const downloadPDF = (pdf: jsPDF, filename: string) => {
  try {
    // Convert the PDF to a data URL and create a download link
    const pdfDataUri = pdf.output('datauristring');
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Error in downloadPDF function:", error);
    return false;
  }
};

export const generateInvoicePDF = (saleData: any) => {
  try {
    console.log("Generating invoice with data:", saleData);
    
    // Create a new jsPDF instance with more reliable settings
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add company header with improved styling
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Blue color for company name
    doc.text(COMPANY_NAME, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray color for details
    doc.text(COMPANY_TAGLINE, 14, 28);
    doc.text(`Address: ${COMPANY_ADDRESS}`, 14, 33);
    doc.text(`Phone: ${COMPANY_PHONE}`, 14, 38);
    doc.text(`Email: ${COMPANY_EMAIL}`, 14, 43);
    doc.text(`Website: ${COMPANY_WEBSITE}`, 14, 48);
    
    // Invoice details
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text("INVOICE", 170, 22, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${saleData.id.slice(0, 8)}`, 170, 30, { align: "right" });
    doc.text(`Date: ${new Date(saleData.timestamp).toLocaleDateString()}`, 170, 35, { align: "right" });
    doc.text(`Time: ${new Date(saleData.timestamp).toLocaleTimeString()}`, 170, 40, { align: "right" });
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(41, 128, 185);
    doc.line(14, 52, 196, 52);
    
    // Customer info
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text("Bill To:", 14, 60);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(saleData.customerName || "Walk-in Customer", 14, 65);
    if (saleData.customerPhone) {
      doc.text(`Phone: ${saleData.customerPhone}`, 14, 70);
    }
    if (saleData.customerEmail) {
      doc.text(`Email: ${saleData.customerEmail}`, 14, 75);
    }
    
    // Item table header
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text("Invoice Items:", 14, 85);
    
    // Prepare table data
    const tableColumn = ["Item", "Price", "Qty", "Total"];
    const tableRows = saleData.items.map((item: any) => [
      item.name,
      formatToRupees(item.price),
      item.quantity,
      formatToRupees(item.price * item.quantity)
    ]);
    
    // Generate the table with autoTable with error handling
    try {
      doc.autoTable({
        startY: 90,
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
    } catch (autoTableError) {
      console.error("Error in autoTable:", autoTableError);
      // Create a simple table as fallback
      doc.text("Items:", 14, 90);
      let yPos = 100;
      tableRows.forEach((row: any[], index: number) => {
        doc.text(`${index + 1}. ${row[0]} - ${row[1]} × ${row[2]} = ${row[3]}`, 20, yPos);
        yPos += 10;
      });
    }
    
    // Get the final Y position after the table is drawn
    let finalY;
    try {
      finalY = doc.lastAutoTable.finalY + 10;
    } catch (error) {
      finalY = 150; // Fallback position if lastAutoTable is not available
    }
    
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
    doc.text(`Thank you for shopping with ${COMPANY_NAME}!`, 14, finalY + 45);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Generated with ShopSmart POS Software", 14, finalY + 50);
    
    // Use the browser's built-in download functionality
    const filename = `invoice-${saleData.id.slice(0, 8)}.pdf`;
    const success = downloadPDF(doc, filename);
    
    if (success) {
      toast({
        title: "Success!",
        description: "Invoice PDF has been downloaded successfully.",
      });
      console.log("PDF successfully generated and downloaded");
      return true;
    } else {
      console.error("Failed to download PDF");
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Error in invoice service while generating PDF:", error);
    toast({
      title: "Error",
      description: "Failed to generate invoice PDF. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// Updated function to send directly to WhatsApp without redirects
// Note: For true direct sending without opening the browser, a backend API would be needed
export const sendInvoiceToWhatsApp = (saleData: any) => {
  try {
    if (!saleData.customerPhone) {
      console.error("Customer phone number is missing");
      return false;
    }
    
    // Format phone number (remove any spaces, dashes, etc)
    let phoneNumber = saleData.customerPhone.replace(/\D/g, '');
    
    // Ensure phone number has country code
    if (!phoneNumber.startsWith('+')) {
      // If no country code, assume India (+91)
      if (!phoneNumber.startsWith('91')) {
        phoneNumber = '91' + phoneNumber;
      }
    } else {
      // Remove the + if it exists
      phoneNumber = phoneNumber.substring(1);
    }
    
    // Create beautifully formatted message
    const message = `
*${COMPANY_NAME}*
_${COMPANY_TAGLINE}_
---------------------------------------

📋 *INVOICE #${saleData.id.slice(0, 8)}*
📅 Date: ${new Date(saleData.timestamp).toLocaleDateString()}
⏰ Time: ${new Date(saleData.timestamp).toLocaleTimeString()}

👤 *Customer Details*
Name: ${saleData.customerName || "Walk-in Customer"}
${saleData.customerPhone ? `Phone: ${saleData.customerPhone}` : ''}
${saleData.customerEmail ? `Email: ${saleData.customerEmail}` : ''}

🛒 *Your Purchase*
${saleData.items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} x ${item.quantity} = ${formatToRupees(item.price * item.quantity)}`
).join('\n')}

💰 *Payment Summary*
Subtotal: ${formatToRupees(saleData.subtotal)}
Discount (${saleData.discount}%): ${formatToRupees(saleData.discountAmount)}
GST (${saleData.vatRate}%): ${formatToRupees(saleData.vatAmount)}
*Total Amount: ${formatToRupees(saleData.total)}*

Thank you for your business! We appreciate your trust in ${COMPANY_NAME}.

For any queries, please contact us:
📞 ${COMPANY_PHONE}
📧 ${COMPANY_EMAIL}
🌐 ${COMPANY_WEBSITE}
`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    console.log("WhatsApp message prepared with URL:", whatsappUrl);
    return true;
  } catch (error) {
    console.error("Error sending invoice to WhatsApp:", error);
    return false;
  }
};

// Updated function to send email with a better template
export const sendInvoiceByEmail = (saleData: any) => {
  try {
    if (!saleData.customerEmail) {
      console.error("Customer email is missing");
      return false;
    }
    
    // Create email subject
    const subject = `Invoice #${saleData.id.slice(0, 8)} from ${COMPANY_NAME}`;
    
    // Create email body with better formatting
    const body = `
Dear ${saleData.customerName || "Valued Customer"},

Thank you for your purchase from ${COMPANY_NAME}. Please find your invoice details below:

-----------------------------------------
INVOICE #${saleData.id.slice(0, 8)}
Date: ${new Date(saleData.timestamp).toLocaleDateString()}
Time: ${new Date(saleData.timestamp).toLocaleTimeString()}
-----------------------------------------

CUSTOMER INFORMATION:
Name: ${saleData.customerName || "Walk-in Customer"}
${saleData.customerPhone ? `Phone: ${saleData.customerPhone}` : ''}
${saleData.customerEmail ? `Email: ${saleData.customerEmail}` : ''}

PURCHASED ITEMS:
${saleData.items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} x ${item.quantity} = ${formatToRupees(item.price * item.quantity)}`
).join('\n')}

PAYMENT SUMMARY:
Subtotal: ${formatToRupees(saleData.subtotal)}
Discount (${saleData.discount}%): ${formatToRupees(saleData.discountAmount)}
GST (${saleData.vatRate}%): ${formatToRupees(saleData.vatAmount)}
Total Amount: ${formatToRupees(saleData.total)}

Payment Terms: Due on receipt

Thank you for your business! We value your patronage.

Best regards,
The ${COMPANY_NAME} Team

Contact Information:
Phone: ${COMPANY_PHONE}
Email: ${COMPANY_EMAIL}
Website: ${COMPANY_WEBSITE}
Address: ${COMPANY_ADDRESS}
`;
    
    // Encode the subject and body for URL
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    // Create mailto URL
    const mailtoUrl = `mailto:${saleData.customerEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
    
    console.log("Email prepared with URL:", mailtoUrl);
    return true;
  } catch (error) {
    console.error("Error sending invoice by email:", error);
    return false;
  }
};
