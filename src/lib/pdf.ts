import jsPDF from 'jspdf';
import type { Document, CompanySettings, Currency } from '@/types';
import { formatDate } from './utils';

// Brand Colors & Constants
// "Samidak" logo seems to have a deep red/maroon and black/grey.
const COLORS = {
  primary: [153, 51, 51] as [number, number, number], // Deep Maroon/Red
  secondary: [44, 62, 80] as [number, number, number], // Dark Slate Blue (Professional dark)
  textDark: [33, 33, 33] as [number, number, number], // Almost Black
  textGray: [100, 100, 100] as [number, number, number], // Medium Gray
  textLight: [150, 150, 150] as [number, number, number], // Light Gray
  tableHeaderBg: [153, 51, 51] as [number, number, number], // Primary
  tableHeaderTx: [255, 255, 255] as [number, number, number], // White
  tableRowOdd: [255, 255, 255] as [number, number, number], // White
  tableRowEven: [249, 249, 249] as [number, number, number], // very light gray
  borderColor: [230, 230, 230] as [number, number, number],
};

const FONTS = {
  regular: 'helvetica',
  bold: 'helvetica', // Use bold variant
};

// Format currency - using NGN/N instead of symbol if needed, but trying symbol with specific font stack if possible.
// For standard jsPDF, '₦' often fails. Let's use 'N' for robustness or specific unicode if supported.
function formatAmount(amount: number, currency: Currency): string {
  const currencyCode = currency === 'NGN' ? 'N' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencyCode} ${formatted}`;
}


// --- Image Handling helper functions ---

// Load full letterhead image
async function loadLetterheadImage(): Promise<string | null> {
  try {
    const response = await fetch('/simidak.png');
    if (!response.ok) return null;
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Crop header portion of letterhead
async function cropLetterheadHeader(img: HTMLImageElement): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    // Adjusted ratio to capture the logo area properly without cutting
    const headerRatio = 0.22;

    canvas.width = img.width;
    canvas.height = img.height * headerRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      img,
      0, 0, img.width, img.height * headerRatio,
      0, 0, canvas.width, canvas.height
    );

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// Crop footer portion of letterhead
async function cropLetterheadFooter(img: HTMLImageElement): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    const footerRatio = 0.10; // Bottom 10%
    const startY = img.height * (1 - footerRatio);

    canvas.width = img.width;
    canvas.height = img.height * footerRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      img,
      0, startY, img.width, img.height * footerRatio,
      0, 0, canvas.width, canvas.height
    );

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// Load and prepare images (letterhead + signature)
async function prepareImages(): Promise<{ header: string | null; footer: string | null; full: string | null; signature: string | null }> {
  try {
    const [letterheadRes, signatureRes] = await Promise.all([
      fetch('/simidak.png'),
      fetch('/signature.png')
    ]);

    let fullHead: string | null = null;
    let header = null;
    let footer = null;
    let signature = null;

    // Process Letterhead
    if (letterheadRes.ok) {
      const blob = await letterheadRes.blob();
      fullHead = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });

      if (fullHead) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = async () => {
            header = await cropLetterheadHeader(img);
            footer = await cropLetterheadFooter(img);
            resolve();
          };
          img.onerror = () => resolve();
          if (fullHead) img.src = fullHead;
        });
      }
    }

    // Process Signature
    if (signatureRes.ok) {
      const blob = await signatureRes.blob();
      signature = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }

    return { header, footer, full: fullHead, signature };
  } catch {
    return { header: null, footer: null, full: null, signature: null };
  }
}

export async function generatePDF(doc: Document, settings: CompanySettings): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 15; // increased margin for cleaner look
  const contentWidth = pageWidth - margin * 2; // 180mm

  // Load images
  const images = await prepareImages();

  const headerHeight = 45; // mm for header image area
  const footerHeight = 25; // mm for footer image area
  let y = 10;

  // --- FULL PAGE BACKGROUND (Header + Watermark + Footer) ---
  if (images.full) {
    pdf.addImage(images.full, 'PNG', 0, 0, pageWidth, pageHeight);
    y = headerHeight + 5;
  } else if (images.header) {
    // Fallback: Header only if full fails
    pdf.addImage(images.header, 'PNG', 0, 0, pageWidth, headerHeight);
    y = headerHeight + 5;
  } else {
    y = 20; // fallback if no image
  }

  // --- COMPANY CONTACT INFO ---
  // Removed as per user request (redundant with letterhead)


  // --- DOCUMENT HEADER SECTION ---
  // Left: Bill To
  // Right: Invoice Info

  const twoColY = y;
  const colWidth = contentWidth / 2 - 5;
  const rightColX = margin + colWidth + 10;

  // -- Label: INVOICE / QUOTATION --
  pdf.setFont(FONTS.bold, 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(...COLORS.primary);
  const title = doc.type.toUpperCase();
  // Right align title to match the professional look or Left?
  // User asked for "extremely professional". Often title is top right.
  // Let's put Title on Top Right, Info below it.
  // User Request: Move title/info down "close to the table" to avoid designs.
  // Adding significant offset (e.g. +35mm) to clear the graphical header.
  const rightColOffset = 35;
  pdf.text(title, pageWidth - margin, y + rightColOffset, { align: 'right' });


  // --- BILL TO (LEFT) ---
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.textGray);
  pdf.setFont(FONTS.regular, 'normal');
  pdf.text('BILL TO', margin, currentY(y));

  pdf.setFontSize(11);
  pdf.setTextColor(...COLORS.textDark);
  pdf.setFont(FONTS.bold, 'bold');
  y += 5;
  pdf.text(doc.customer.name, margin, y);

  pdf.setFontSize(10);
  pdf.setFont(FONTS.regular, 'normal');
  pdf.setTextColor(...COLORS.textDark);
  y += 5;

  let addrY = y;
  if (doc.customer.address) {
    const splitAddr = pdf.splitTextToSize(doc.customer.address, colWidth);
    pdf.text(splitAddr, margin, addrY);
    addrY += (splitAddr.length * 4); // spacing
  }
  if (doc.customer.phone) {
    pdf.text(doc.customer.phone, margin, addrY);
    addrY += 4;
  }
  if (doc.customer.email) {
    pdf.text(doc.customer.email, margin, addrY);
    addrY += 4;
  }

  // --- DOC INFO (RIGHT) ---
  // We align this block to the right, under the huge title

  let infoY = twoColY + rightColOffset + 10; // Start info below the shifted title
  const labelX = rightColX + 20;
  const valueX = pageWidth - margin;

  // Helper to draw row
  const drawInfoRow = (label: string, value: string) => {
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.textGray);
    pdf.setFont(FONTS.regular, 'normal');
    pdf.text(label, labelX, infoY);

    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.textDark);
    pdf.setFont(FONTS.bold, 'bold');
    pdf.text(value, valueX, infoY, { align: 'right' });
    infoY += 6;
  };

  drawInfoRow(`${doc.type === 'invoice' ? 'Invoice' : 'Document'} No:`, doc.serialNumber);
  drawInfoRow('Date:', formatDate(doc.createdAt));
  // Additional info can go here

  // Move y to the greater of the two columns + spacing
  y = Math.max(addrY, infoY) + 15;


  // --- ITEM TABLE ---
  // Professional tables have:
  // - Clear headings
  // - Right aligned numbers
  // - Subtle dividers

  const headers = ['S/N', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT'];
  // Widths in %, roughly summing to 100% of contentWidth
  // Fixed widths in mm
  const wSN = 12;
  const wQty = 15;
  const wPrice = 35;
  const wAmount = 35;
  const wDesc = contentWidth - (wSN + wQty + wPrice + wAmount); // remaining space

  const xSN = margin;
  const xDesc = xSN + wSN;
  const xQty = xDesc + wDesc;
  const xPrice = xQty + wQty;
  const xAmount = xPrice + wPrice;

  // Header Background
  const headerH = 10;
  pdf.setFillColor(...COLORS.tableHeaderBg);
  pdf.rect(margin, y, contentWidth, headerH, 'F');

  // Header Text
  const headerTextY = y + 6.5;
  pdf.setFontSize(8);
  pdf.setFont(FONTS.bold, 'bold');
  pdf.setTextColor(...COLORS.tableHeaderTx);

  pdf.text('S/N', xSN + (wSN / 2), headerTextY, { align: 'center' });
  pdf.text('DESCRIPTION', xDesc + 2, headerTextY, { align: 'left' });
  pdf.text('QTY', xQty + (wQty / 2), headerTextY, { align: 'center' });
  pdf.text('UNIT PRICE', xPrice + wPrice - 2, headerTextY, { align: 'right' });
  pdf.text('AMOUNT', xAmount + wAmount - 2, headerTextY, { align: 'right' });

  y += headerH;

  // Rows
  const rowH = 10; // slightly taller for breathing room
  doc.items.forEach((item, index) => {
    // Check page break
    if (y + rowH > pageHeight - footerHeight - 40) { // Keep space for totals/footer
      pdf.addPage();
      // Re-draw header image on new page? Usually yes for branding consistency, or just small logo.
      // User Request: Remove header from next (page 2 and on) but keep watermark (part of full image).
      if (images.full) {
        pdf.addImage(images.full, 'PNG', 0, 0, pageWidth, pageHeight);
        // Mask the header part to hide the logo, but keep watermark/footer
        // The header graphics extend deeper than expected.
        // Using 120mm to be absolutely safe and cover all top graphics.
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, 120, 'F');
        y = 20; // Start content higher since no header
      } else if (images.header) {
        // If only header exists (fallback), do NOT draw it on page 2+ as per request
        y = 20;
      } else {
        y = 20;
      }

      // Re-draw table header
      pdf.setFillColor(...COLORS.tableHeaderBg);
      pdf.rect(margin, y, contentWidth, headerH, 'F');
      pdf.setFontSize(8);
      pdf.setFont(FONTS.bold, 'bold');
      pdf.setTextColor(...COLORS.tableHeaderTx);
      const hy = y + 6.5;
      pdf.text('S/N', xSN + (wSN / 2), hy, { align: 'center' });
      pdf.text('DESCRIPTION', xDesc + 2, hy, { align: 'left' });
      pdf.text('QTY', xQty + (wQty / 2), hy, { align: 'center' });
      pdf.text('UNIT PRICE', xPrice + wPrice - 2, hy, { align: 'right' });
      pdf.text('AMOUNT', xAmount + wAmount - 2, hy, { align: 'right' });
      y += headerH;
    }

    // Zebra striping
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.tableRowOdd);
    } else {
      pdf.setFillColor(...COLORS.tableRowEven);
    }
    pdf.rect(margin, y, contentWidth, rowH, 'F');

    // Row Content
    pdf.setFontSize(9);
    pdf.setFont(FONTS.regular, 'normal');
    pdf.setTextColor(...COLORS.textDark);
    const ry = y + 6;

    pdf.text((index + 1).toString(), xSN + (wSN / 2), ry, { align: 'center' });

    // Truncate description if too long to keep strict line height for now (can expand later if needed)
    let desc = item.description;
    const maxDescW = wDesc - 4;
    if (pdf.getTextWidth(desc) > maxDescW) {
      // simple truncation
      desc = pdf.splitTextToSize(desc, maxDescW)[0] + '...';
    }
    pdf.text(desc, xDesc + 2, ry, { align: 'left' });

    pdf.text(item.quantity.toString(), xQty + (wQty / 2), ry, { align: 'center' });

    pdf.text(formatAmount(item.unitPrice, doc.currency), xPrice + wPrice - 2, ry, { align: 'right' });

    pdf.setFont(FONTS.bold, 'bold');
    pdf.text(formatAmount(item.amount, doc.currency), xAmount + wAmount - 2, ry, { align: 'right' });

    // Bottom border for row
    pdf.setDrawColor(...COLORS.borderColor);
    pdf.setLineWidth(0.1);
    pdf.line(margin, y + rowH, widthLimit(), y + rowH);

    y += rowH;
  });

  // --- TOTALS SECTION ---
  y += 5;
  const totalsW = wPrice + wAmount + 10;
  const totalsX = pageWidth - margin - totalsW;

  // Subtotal
  pdf.setFontSize(9);
  pdf.setFont(FONTS.regular, 'normal');
  pdf.setTextColor(...COLORS.textGray);
  pdf.text('Subtotal:', totalsX, y);
  pdf.setTextColor(...COLORS.textDark);
  pdf.text(formatAmount(doc.subtotal, doc.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;

  // Tax
  pdf.setTextColor(...COLORS.textGray);
  pdf.text(`Tax (${doc.taxRate}%):`, totalsX, y);
  pdf.setTextColor(...COLORS.textDark);
  pdf.text(formatAmount(doc.tax, doc.currency), pageWidth - margin, y, { align: 'right' });
  y += 8;

  // Grand Total - Highlighted
  pdf.setFillColor(...COLORS.primary); // background bar? Or just colored text? 
  // Let's do a subtle background bar for total
  pdf.setFillColor(252, 237, 237); // extremely light red
  pdf.rect(totalsX - 5, y - 6, totalsW + 5, 10, 'F');

  pdf.setFontSize(11);
  pdf.setFont(FONTS.bold, 'bold');
  pdf.setTextColor(...COLORS.primary);
  pdf.text('TOTAL:', totalsX, y);
  pdf.text(formatAmount(doc.total, doc.currency), pageWidth - margin, y, { align: 'right' });

  y += 15;


  // --- BANK DETAILS / NOTES ---

  // Ensure we don't hit footer
  if (y + 40 > pageHeight - footerHeight) {
    pdf.addPage();
    if (images.full) {
      pdf.addImage(images.full, 'PNG', 0, 0, pageWidth, pageHeight);
      // Mask the header part
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, 120, 'F'); // Increased to match items loop
      y = 20;
    } else if (images.header) {
      // Don't draw header on new page
      y = 20;
    } else {
      y = 20;
    }
  }

  // Payment Info - Styled Box
  const bankAccounts = settings.bankAccounts || [];
  if (doc.type === 'invoice' && bankAccounts.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont(FONTS.bold, 'bold');
    pdf.setTextColor(...COLORS.primary);
    pdf.text('PAYMENT DETAILS', margin, y);
    y += 5;

    pdf.setDrawColor(...COLORS.primary);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, margin + 40, y); // underline
    y += 5;

    bankAccounts.forEach(acc => {
      pdf.setFontSize(9);
      pdf.setFont(FONTS.regular, 'normal');
      pdf.setTextColor(...COLORS.textGray);

      const startX = margin;
      // Bank Name
      pdf.text('Bank Name:', startX, y);
      pdf.setFont(FONTS.bold, 'bold');
      pdf.setTextColor(...COLORS.textDark);
      pdf.text(acc.bankName, startX + 25, y);
      y += 5;

      // Account Name
      pdf.setFont(FONTS.regular, 'normal');
      pdf.setTextColor(...COLORS.textGray);
      pdf.text('Account Name:', startX, y);
      pdf.setFont(FONTS.bold, 'bold');
      pdf.setTextColor(...COLORS.textDark);
      pdf.text(acc.accountName, startX + 25, y);
      y += 5;

      // Account No
      pdf.setFont(FONTS.regular, 'normal');
      pdf.setTextColor(...COLORS.textGray);
      pdf.text('Account No:', startX, y);
      pdf.setFont(FONTS.bold, 'bold');
      pdf.setTextColor(...COLORS.primary); // Highlight acc number
      pdf.text(acc.accountNumber, startX + 25, y);
      y += 8; // spacing between banks
    });
  }

  // Notes
  if (doc.notes) {
    y += 5;
    pdf.setFontSize(9);
    pdf.setFont(FONTS.bold, 'bold');
    pdf.setTextColor(...COLORS.primary);
    pdf.text('NOTES', margin, y);
    y += 5;

    pdf.setFontSize(8);
    pdf.setFont(FONTS.regular, 'normal');
    pdf.setTextColor(...COLORS.textGray);
    const splitNotes = pdf.splitTextToSize(doc.notes, contentWidth);
    pdf.text(splitNotes, margin, y);
    y += (splitNotes.length * 4); // update y based on lines
  }


  // --- SIGNATURE BLOCK ---
  // Ensure we don't hit footer with the signature
  // We need about 40-50mm for the signature block
  if (y + 50 > pageHeight - footerHeight) {
    pdf.addPage();
    if (images.full) {
      pdf.addImage(images.full, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, 120, 'F');
      y = 20;
    } else {
      y = 20;
    }
  }

  y += 10; // Spacing before signature

  if (images.signature) {
    // Draw signature image
    // Assume signature aspect ratio is roughly 2:1 or similar. Fixed width 40mm.
    const sigW = 40;
    const sigH = 20;
    pdf.addImage(images.signature, 'PNG', margin, y, sigW, sigH);
    y += sigH - 8; // Aggressive reduction to account for whitespace in signature image (makes signature rest directly on line)
  } else {
    y += 20; // Space for manual signature if image fails
  }

  // Underline - drawn at the exact bottom of signature (signature stands on the line)
  const lineW = 50;
  pdf.setDrawColor(...COLORS.textDark); // Black line
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + lineW, y);
  y += 5;

  // Title
  pdf.setFontSize(10);
  pdf.setFont(FONTS.bold, 'bold');
  pdf.setTextColor(...COLORS.textDark);
  // Center text relative to the line
  // line goes from margin to margin+lineW. Center is margin + lineW/2.
  pdf.text('Technical Director', margin + (lineW / 2), y, { align: 'center' });


  // --- FOOTER IMAGE ---
  // Always at bottom. If we have full background, it already includes footer.
  if (!images.full && images.footer) {
    pdf.addImage(images.footer, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
  }

  return pdf;

  function currentY(val: number) { return val; } // helper mostly for reading clarity
  function widthLimit() { return pageWidth - margin; }
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
