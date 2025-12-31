import jsPDF from 'jspdf';
import type { Document, CompanySettings, Currency } from '@/types';
import { formatDate } from './utils';

// Format currency without using Intl (for PDF compatibility)
function formatAmount(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    NGN: 'N',
    USD: '$',
    EUR: 'E',
    GBP: 'L',
  };
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbols[currency]}${formatted}`;
}

export async function generatePDF(doc: Document, settings: CompanySettings): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Colors
  const brandRed = [220, 38, 38] as const;
  const darkGray = [31, 41, 55] as const;
  const mediumGray = [75, 85, 99] as const;
  const lightGray = [156, 163, 175] as const;
  const tableHeaderBg = [249, 250, 251] as const;
  const tableBorderColor = [229, 231, 235] as const;

  // === HEADER SECTION ===
  // Company Name (left)
  pdf.setFontSize(28);
  pdf.setTextColor(...brandRed);
  pdf.setFont('helvetica', 'bold');
  pdf.text(settings.name, margin, y + 5);

  // Document Type Badge (right)
  const typeLabels = { invoice: 'INVOICE', quotation: 'QUOTATION', waybill: 'WAYBILL' };
  const docLabel = typeLabels[doc.type];
  
  pdf.setFontSize(20);
  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'bold');
  pdf.text(docLabel, pageWidth - margin, y + 5, { align: 'right' });

  y += 15;

  // Company Details (left)
  pdf.setFontSize(9);
  pdf.setTextColor(...mediumGray);
  pdf.setFont('helvetica', 'normal');
  pdf.text(settings.address, margin, y);
  y += 4;
  pdf.text(`Tel: ${settings.phone}`, margin, y);
  y += 4;
  pdf.text(`Email: ${settings.email}`, margin, y);

  // Document Info (right)
  const infoX = pageWidth - margin;
  let infoY = y - 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`#${doc.serialNumber}`, infoX, infoY, { align: 'right' });
  infoY += 5;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...mediumGray);
  pdf.text(`Date: ${formatDate(doc.createdAt)}`, infoX, infoY, { align: 'right' });
  if (doc.dueDate) {
    infoY += 5;
    pdf.text(`Due: ${formatDate(doc.dueDate)}`, infoX, infoY, { align: 'right' });
  }

  y += 15;

  // === DIVIDER LINE ===
  pdf.setDrawColor(...tableBorderColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 12;

  // === BILL TO SECTION ===
  // Two column layout
  const colWidth = contentWidth / 2;

  // Bill To (left column)
  pdf.setFontSize(8);
  pdf.setTextColor(...lightGray);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILL TO', margin, y);
  y += 5;

  pdf.setFontSize(11);
  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.customer.name, margin, y);
  y += 5;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...mediumGray);
  
  if (doc.customer.address) {
    const addressLines = pdf.splitTextToSize(doc.customer.address, colWidth - 10);
    pdf.text(addressLines, margin, y);
    y += addressLines.length * 4;
  }
  if (doc.customer.phone) {
    pdf.text(`Tel: ${doc.customer.phone}`, margin, y);
    y += 4;
  }
  if (doc.customer.email) {
    pdf.text(`Email: ${doc.customer.email}`, margin, y);
    y += 4;
  }

  y += 10;

  // === ITEMS TABLE ===
  const tableStartY = y;
  const col1Width = contentWidth * 0.45; // Description
  const col2Width = contentWidth * 0.12; // Qty
  const col3Width = contentWidth * 0.20; // Unit Price
  const col4Width = contentWidth * 0.23; // Amount

  const col1X = margin;
  const col2X = margin + col1Width;
  const col3X = col2X + col2Width;
  const col4X = col3X + col3Width;

  // Table Header
  const headerHeight = 10;
  pdf.setFillColor(...tableHeaderBg);
  pdf.rect(margin, y, contentWidth, headerHeight, 'F');
  
  pdf.setDrawColor(...tableBorderColor);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, y, contentWidth, headerHeight, 'S');

  pdf.setFontSize(8);
  pdf.setTextColor(...mediumGray);
  pdf.setFont('helvetica', 'bold');
  
  const headerY = y + 6.5;
  pdf.text('DESCRIPTION', col1X + 3, headerY);
  pdf.text('QTY', col2X + col2Width / 2, headerY, { align: 'center' });
  pdf.text('UNIT PRICE', col3X + col3Width - 3, headerY, { align: 'right' });
  pdf.text('AMOUNT', col4X + col4Width - 3, headerY, { align: 'right' });

  y += headerHeight;

  // Table Rows
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...darkGray);
  const rowHeight = 10;

  doc.items.forEach((item, index) => {
    // Check for page break
    if (y + rowHeight > pageHeight - 60) {
      pdf.addPage();
      y = 20;
    }

    // Alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(254, 254, 254);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    // Row border
    pdf.setDrawColor(...tableBorderColor);
    pdf.rect(margin, y, contentWidth, rowHeight, 'S');

    const rowY = y + 6.5;
    pdf.setFontSize(9);
    
    // Description (truncate if too long)
    const desc = item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description;
    pdf.text(desc, col1X + 3, rowY);
    
    // Quantity (centered)
    pdf.text(String(item.quantity), col2X + col2Width / 2, rowY, { align: 'center' });
    
    // Unit Price (right aligned)
    pdf.text(formatAmount(item.unitPrice, doc.currency), col3X + col3Width - 3, rowY, { align: 'right' });
    
    // Amount (right aligned, bold)
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatAmount(item.amount, doc.currency), col4X + col4Width - 3, rowY, { align: 'right' });
    pdf.setFont('helvetica', 'normal');

    y += rowHeight;
  });

  y += 8;

  // === TOTALS SECTION ===
  const totalsWidth = 80;
  const totalsX = pageWidth - margin - totalsWidth;
  const labelX = totalsX;
  const valueX = pageWidth - margin;

  // Subtotal
  pdf.setFontSize(9);
  pdf.setTextColor(...mediumGray);
  pdf.text('Subtotal:', labelX, y);
  pdf.setTextColor(...darkGray);
  pdf.text(formatAmount(doc.subtotal, doc.currency), valueX, y, { align: 'right' });
  y += 6;

  // Tax
  pdf.setTextColor(...mediumGray);
  pdf.text(`VAT (${doc.taxRate}%):`, labelX, y);
  pdf.setTextColor(...darkGray);
  pdf.text(formatAmount(doc.tax, doc.currency), valueX, y, { align: 'right' });
  y += 8;

  // Total line
  pdf.setDrawColor(...tableBorderColor);
  pdf.line(totalsX, y - 2, pageWidth - margin, y - 2);

  // Total
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...darkGray);
  pdf.text('TOTAL:', labelX, y + 4);
  pdf.setTextColor(...brandRed);
  pdf.text(formatAmount(doc.total, doc.currency), valueX, y + 4, { align: 'right' });

  y += 20;

  // === PAYMENT DETAILS (for invoices) ===
  if (doc.type === 'invoice' && settings.bankName && settings.accountNumber) {
    // Check for page break
    if (y + 30 > pageHeight - 30) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFillColor(...tableHeaderBg);
    pdf.rect(margin, y, contentWidth / 2, 25, 'F');
    pdf.setDrawColor(...tableBorderColor);
    pdf.rect(margin, y, contentWidth / 2, 25, 'S');

    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT DETAILS', margin + 5, y + 6);

    pdf.setFontSize(9);
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Bank: ${settings.bankName}`, margin + 5, y + 13);
    pdf.text(`Account: ${settings.accountNumber}`, margin + 5, y + 19);

    y += 32;
  }

  // === NOTES ===
  if (doc.notes) {
    // Check for page break
    if (y + 20 > pageHeight - 30) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTES', margin, y);
    y += 5;

    pdf.setFontSize(9);
    pdf.setTextColor(...mediumGray);
    pdf.setFont('helvetica', 'normal');
    const noteLines = pdf.splitTextToSize(doc.notes, contentWidth);
    pdf.text(noteLines, margin, y);
  }

  // === FOOTER ===
  pdf.setFontSize(8);
  pdf.setTextColor(...lightGray);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, { align: 'center' });

  return pdf;
}

export function downloadPDF(pdf: jsPDF, filename: string) {
  pdf.save(`${filename}.pdf`);
}

export function printPDF(pdf: jsPDF) {
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
