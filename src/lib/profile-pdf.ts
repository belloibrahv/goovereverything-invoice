import jsPDF from 'jspdf';
import type { CompanySettings, CompanyProfileContent } from '@/types';
import { dataUrlToJsPdfFormat } from './image-utils';

const BRAND: [number, number, number] = [161, 4, 9];
const BRAND_LIGHT: [number, number, number] = [196, 26, 32];
const DARK: [number, number, number] = [17, 24, 39];
const GRAY: [number, number, number] = [100, 100, 100];
const MUTED: [number, number, number] = [156, 163, 175];
const LIGHT: [number, number, number] = [248, 246, 246];
const WHITE: [number, number, number] = [255, 255, 255];

const SERVICES = [
  ['01', 'Industrial Equipment Supply'],
  ['02', 'Air Compressor Systems'],
  ['03', 'Installation & Commissioning'],
  ['04', 'Mechanical Installation'],
  ['05', 'Pipeline Installation'],
  ['06', 'Preventive Maintenance'],
  ['07', 'Breakdown Maintenance'],
  ['08', 'Equipment Repair & Servicing'],
  ['09', 'Spare Parts Supply'],
  ['10', 'Technical Consultation'],
  ['11', 'System Optimization'],
  ['12', 'Technical Support'],
] as const;

const PRODUCTS = [
  'Compressors',
  'Air Dryers',
  'Air Receivers',
  'Industrial Pumps',
  'Electric Motors',
  'Industrial Valves',
  'Hydraulic Components',
  'Pneumatic Components',
  'Mechanical Seals',
  'Filters & Bearings',
  'Pressure Gauges',
  'Control Panels',
];

const INDUSTRIES = [
  'Manufacturing',
  'Food Processing',
  'Pharmaceutical',
  'Oil & Gas',
  'Plastic Production',
  'Packaging',
  'Chemical',
  'Power & Energy',
  'Warehousing',
  'Construction',
  'Automotive',
  'FMCG',
];

const VALUES = [
  'Professionalism',
  'Integrity',
  'Quality',
  'Innovation',
  'Customer First',
  'Safety',
  'Reliability',
  'Continuous Improvement',
];

const WHY = [
  ['Experienced Engineers', 'Skilled technical teams for industrial environments'],
  ['Quality Products', 'Reliable equipment and genuine spare parts'],
  ['Fast Response', 'Responsive support when uptime matters'],
  ['Technical Expertise', 'Engineering judgment across compressed air & utilities'],
  ['Reliable Delivery', 'Clear process from requirement to commissioning'],
  ['Long-Term Support', 'Maintenance and after-sales beyond handover'],
] as const;

type Assets = {
  icon: string | null;
  wordmark: string | null;
};

async function loadPublicImage(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function safeImage(
  pdf: jsPDF,
  dataUrl: string | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!dataUrl) return false;
  try {
    pdf.addImage(dataUrl, dataUrlToJsPdfFormat(dataUrl), x, y, w, h);
    return true;
  } catch {
    return false;
  }
}

function drawAccentBars(pdf: jsPDF, pageWidth: number) {
  // Top brand ribbon + diagonal corner motif (letterhead-inspired)
  pdf.setFillColor(...BRAND);
  pdf.rect(0, 0, pageWidth, 3.2, 'F');
  pdf.setFillColor(...DARK);
  pdf.triangle(pageWidth - 42, 0, pageWidth, 0, pageWidth, 28, 'F');
  pdf.setFillColor(...BRAND);
  pdf.triangle(pageWidth - 28, 0, pageWidth, 0, pageWidth, 18, 'F');
  pdf.setFillColor(220, 220, 220);
  pdf.triangle(pageWidth - 18, 0, pageWidth, 0, pageWidth, 10, 'F');
}

function drawPageHeader(pdf: jsPDF, assets: Assets, pageWidth: number, sectionLabel: string) {
  drawAccentBars(pdf, pageWidth);
  safeImage(pdf, assets.icon, 14, 8, 14, 14);
  if (assets.wordmark) {
    safeImage(pdf, assets.wordmark, 30, 9, 52, 12);
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...BRAND);
    pdf.text('SAMIDAK', 32, 17);
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text(sectionLabel.toUpperCase(), pageWidth - 14, 17, { align: 'right' });
  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.3);
  pdf.line(14, 24, pageWidth - 14, 24);
}

function drawFooter(
  pdf: jsPDF,
  assets: Assets,
  pageWidth: number,
  pageHeight: number,
  page: number,
  total: number,
  contacts: { email: string; phone: string; web: string }
) {
  pdf.setFillColor(...LIGHT);
  pdf.rect(0, pageHeight - 16, pageWidth, 16, 'F');
  pdf.setFillColor(...BRAND);
  pdf.rect(0, pageHeight - 16, pageWidth, 1.2, 'F');
  safeImage(pdf, assets.icon, 12, pageHeight - 13.5, 8, 8);
  pdf.setFontSize(6.5);
  pdf.setTextColor(...GRAY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${contacts.email}  ·  ${contacts.phone}`, 23, pageHeight - 8.5);
  pdf.text(contacts.web, 23, pageHeight - 4.8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...BRAND);
  pdf.text(`${page} / ${total}`, pageWidth - 12, pageHeight - 6.5, { align: 'right' });
}

function sectionTitle(pdf: jsPDF, title: string, y: number, eyebrow?: string) {
  if (eyebrow) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND);
    pdf.text(eyebrow.toUpperCase(), 15, y);
    y += 6;
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(...DARK);
  pdf.text(title, 15, y);
  pdf.setFillColor(...BRAND);
  pdf.rect(15, y + 3.5, 22, 1.4, 'F');
  pdf.setFillColor(220, 220, 220);
  pdf.rect(39, y + 4, 28, 0.6, 'F');
  return y + 14;
}

function bodyText(pdf: jsPDF, text: string, x: number, y: number, maxW: number, size = 9.5) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(size);
  pdf.setTextColor(...DARK);
  const lines = pdf.splitTextToSize(text, maxW);
  pdf.text(lines, x, y);
  return y + lines.length * (size * 0.42) + 2;
}

function card(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  body?: string
) {
  pdf.setFillColor(...WHITE);
  pdf.setDrawColor(235, 235, 235);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, 2, 2, 'FD');
  pdf.setFillColor(...BRAND);
  pdf.rect(x, y, 2.2, h, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text(title, x + 7, y + 9);
  if (body) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    const lines = pdf.splitTextToSize(body, w - 12);
    pdf.text(lines, x + 7, y + 16);
  }
}

export async function generateCompanyProfilePDF(
  settings: CompanySettings,
  profile: CompanyProfileContent
): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageWidth - margin * 2;
  const totalPages = 11;

  const [icon, wordmark] = await Promise.all([
    loadPublicImage('/logo.png'),
    loadPublicImage('/samidak-logo.png'),
  ]);
  const assets: Assets = { icon, wordmark };

  const contacts = {
    email: settings.email || 'info@samidakservices.com',
    phone: settings.phone || '+234 816 236 8769',
    web: settings.website || 'www.samidakservices.com',
  };

  const startInnerPage = (pageNum: number, label: string) => {
    if (pageNum > 1) pdf.addPage();
    drawPageHeader(pdf, assets, pageWidth, label);
    drawFooter(pdf, assets, pageWidth, pageHeight, pageNum, totalPages, contacts);
  };

  // ===================== PAGE 1 — COVER =====================
  // Full bleed brand field
  pdf.setFillColor(...BRAND);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Geometric accents (inspired by letterhead diagonals)
  pdf.setFillColor(122, 3, 7);
  pdf.triangle(0, 0, 70, 0, 0, 90, 'F');
  pdf.setFillColor(20, 20, 20);
  pdf.triangle(pageWidth, 0, pageWidth - 90, 0, pageWidth, 110, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.triangle(pageWidth, pageHeight - 70, pageWidth - 55, pageHeight, pageWidth, pageHeight, 'F');
  pdf.setFillColor(...BRAND_LIGHT);
  pdf.rect(0, pageHeight - 3, pageWidth, 3, 'F');

  // Hero band
  if (profile.heroImage) {
    safeImage(pdf, profile.heroImage, 0, 148, pageWidth, 85);
    pdf.setFillColor(...BRAND);
    pdf.rect(0, 148, pageWidth, 6, 'F');
    pdf.rect(0, 227, pageWidth, 6, 'F');
  }

  // Logos — icon + full wordmark
  safeImage(pdf, icon, margin, 28, 32, 32);
  if (wordmark) {
    // Wordmark PNG is on dark bg — place on dark panel
    pdf.setFillColor(10, 10, 10);
    pdf.roundedRect(margin + 38, 30, 95, 28, 2, 2, 'F');
    safeImage(pdf, wordmark, margin + 42, 33, 88, 22);
  } else {
    pdf.setTextColor(...WHITE);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text('SAMIDAK', margin + 38, 48);
  }

  pdf.setTextColor(...WHITE);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('TECHNICAL AND ALLIED SERVICES NIGERIA LIMITED', margin, 72);
  pdf.setFontSize(7);
  pdf.setTextColor(255, 200, 200);
  pdf.text(`REG NO: ${(settings.regNumber || 'RC 6891936').replace(/^RC\s*/i, '')}`, margin, 78);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(...WHITE);
  pdf.text('COMPANY PROFILE', margin, 105);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(12);
  pdf.setTextColor(255, 230, 230);
  const tagLines = pdf.splitTextToSize(
    profile.tagline || 'Industrial Engineering Solutions You Can Trust',
    contentW - 20
  );
  pdf.text(tagLines, margin, 116);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...WHITE);
  pdf.text('Powering Industry. Delivering Value.', margin, 132);

  pdf.setFontSize(8);
  pdf.text('Lagos, Nigeria', margin, 250);
  pdf.text(contacts.web, margin, 256);
  pdf.text(`${contacts.email}  ·  ${contacts.phone}`, margin, 262);
  pdf.setFontSize(7);
  pdf.setTextColor(255, 200, 200);
  pdf.text('Customer Resource  ·  Version 1.0  ·  2026', margin, 275);

  // ===================== PAGE 2 — WHO WE ARE =====================
  startInnerPage(2, 'About SAMIDAK');
  let y = sectionTitle(pdf, 'Who We Are', 36, '01 — Introduction');
  y = bodyText(pdf, profile.whoWeAre, margin, y, contentW, 10.5);
  y += 6;

  // Three pillars
  const pillars = [
    ['KEEP EQUIPMENT', 'RUNNING'],
    ['REDUCE', 'DOWNTIME'],
    ['IMPROVE OPERATIONAL', 'PERFORMANCE'],
  ];
  const pw = (contentW - 8) / 3;
  pillars.forEach((p, i) => {
    const x = margin + i * (pw + 4);
    pdf.setFillColor(...BRAND);
    pdf.roundedRect(x, y, pw, 28, 2, 2, 'F');
    pdf.setTextColor(...WHITE);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(p[0], x + pw / 2, y + 12, { align: 'center' });
    pdf.text(p[1], x + pw / 2, y + 19, { align: 'center' });
  });
  y += 36;

  if (profile.teamImage) {
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(margin, y, contentW, 78, 2, 2, 'F');
    safeImage(pdf, profile.teamImage, margin + 2, y + 2, contentW - 4, 74);
    y += 84;
  }

  y = bodyText(
    pdf,
    'From equipment supply and compressed air systems to installation, maintenance, repairs, and long-term technical support — SAMIDAK is built to keep industry moving.',
    margin,
    y,
    contentW,
    9.5
  );

  // ===================== PAGE 3 — VISION / MISSION / VALUES =====================
  startInnerPage(3, 'Purpose');
  y = sectionTitle(pdf, 'Vision, Mission & Values', 36, '02 — Direction');

  // Vision / Mission stacked panels
  pdf.setFillColor(...LIGHT);
  pdf.roundedRect(margin, y, contentW, 48, 2, 2, 'F');
  pdf.setFillColor(...BRAND);
  pdf.rect(margin, y, 4, 48, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...BRAND);
  pdf.text('OUR VISION', margin + 10, y + 12);
  bodyText(pdf, profile.vision, margin + 10, y + 20, contentW - 18, 9);
  y += 54;

  pdf.setFillColor(...DARK);
  pdf.roundedRect(margin, y, contentW, 48, 2, 2, 'F');
  pdf.setFillColor(...BRAND);
  pdf.rect(margin, y, 4, 48, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...WHITE);
  pdf.text('OUR MISSION', margin + 10, y + 12);
  pdf.setTextColor(230, 230, 230);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const missionLines = pdf.splitTextToSize(profile.mission, contentW - 18);
  pdf.text(missionLines, margin + 10, y + 20);
  y += 58;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...DARK);
  pdf.text('OUR VALUES', margin, y);
  y += 8;

  const vw = (contentW - 9) / 4;
  VALUES.forEach((v, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = margin + col * (vw + 3);
    const yy = y + row * 22;
    pdf.setFillColor(...WHITE);
    pdf.setDrawColor(235, 235, 235);
    pdf.roundedRect(x, yy, vw, 18, 1.5, 1.5, 'FD');
    pdf.setFillColor(...BRAND);
    pdf.circle(x + 6, yy + 9, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...DARK);
    pdf.text(v, x + 11, yy + 10.5);
  });

  // ===================== PAGE 4 — WHY SAMIDAK =====================
  startInnerPage(4, 'Why Us');
  y = sectionTitle(pdf, 'Why Businesses Choose SAMIDAK', 36, '03 — Differentiation');
  y = bodyText(
    pdf,
    'We combine engineering capability, reliable supply, and responsive support so industrial customers can protect uptime and performance.',
    margin,
    y,
    contentW,
    9.5
  );
  y += 6;

  const cw = (contentW - 8) / 2;
  WHY.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (cw + 8);
    const yy = y + row * 36;
    card(pdf, x, yy, cw, 30, item[0], item[1]);
  });

  // ===================== PAGE 5 — SERVICES =====================
  startInnerPage(5, 'Services');
  y = sectionTitle(pdf, 'Our Engineering Services', 36, '04 — Capabilities');
  y = bodyText(
    pdf,
    'End-to-end industrial engineering support across supply, installation, maintenance, and technical services.',
    margin,
    y,
    contentW,
    9.5
  );
  y += 8;

  const sw = (contentW - 8) / 2;
  SERVICES.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (sw + 8);
    const yy = y + row * 14;
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(x, yy, sw, 12, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND);
    pdf.text(s[0], x + 4, yy + 7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...DARK);
    pdf.text(s[1], x + 14, yy + 7.5);
  });

  // ===================== PAGE 6 — PRODUCTS =====================
  startInnerPage(6, 'Products');
  y = sectionTitle(pdf, 'Product Portfolio', 36, '05 — Equipment');
  y = bodyText(
    pdf,
    'Industrial products and equipment we supply, support, and service — subject to availability and applicable manufacturer arrangements.',
    margin,
    y,
    contentW,
    9.5
  );
  y += 4;

  const imgs = profile.productImages || [];
  if (imgs.length > 0) {
    const grid = Math.min(imgs.length, 6);
    const gw = (contentW - 8) / 3;
    const gh = 36;
    for (let i = 0; i < grid; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margin + col * (gw + 4);
      const yy = y + row * (gh + 10);
      pdf.setFillColor(...LIGHT);
      pdf.roundedRect(x, yy, gw, gh, 1.5, 1.5, 'F');
      safeImage(pdf, imgs[i].dataUrl, x + 1, yy + 1, gw - 2, gh - 2);
      if (imgs[i].caption) {
        pdf.setFontSize(6.5);
        pdf.setTextColor(...GRAY);
        pdf.text(imgs[i].caption!, x, yy + gh + 4);
      }
    }
    y += Math.ceil(grid / 3) * (gh + 10) + 2;
  }

  PRODUCTS.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (contentW / 3);
    const yy = Math.max(y, 175) + row * 9;
    pdf.setFillColor(...BRAND);
    pdf.circle(x + 2, yy - 1.2, 1.1, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'normal');
    pdf.text(p, x + 6, yy);
  });

  // ===================== PAGE 7 — COMPRESSED AIR + PROCESS =====================
  startInnerPage(7, 'Solutions');
  y = sectionTitle(pdf, 'Compressed Air Solutions', 36, '06 — Specialty');
  y = bodyText(
    pdf,
    "We don't just supply compressors. We support the complete compressed air system — supply, installation, distribution, maintenance, leak detection, and performance optimization.",
    margin,
    y,
    contentW,
    9.5
  );
  y += 8;

  const flow = ['COMPRESSOR', 'RECEIVER', 'DRYER', 'FILTER', 'PIPELINE', 'POINT OF USE'];
  const fw = contentW / flow.length;
  flow.forEach((step, i) => {
    const x = margin + i * fw;
    pdf.setFillColor(i % 2 === 0 ? BRAND[0] : DARK[0], i % 2 === 0 ? BRAND[1] : DARK[1], i % 2 === 0 ? BRAND[2] : DARK[2]);
    pdf.roundedRect(x + 1, y, fw - 3, 14, 1.5, 1.5, 'F');
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(5.8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(step, x + fw / 2 - 1, y + 8.5, { align: 'center' });
    if (i < flow.length - 1) {
      pdf.setFillColor(...MUTED);
      pdf.triangle(x + fw - 1.5, y + 5, x + fw - 1.5, y + 9, x + fw + 0.5, y + 7, 'F');
    }
  });
  y += 26;

  y = sectionTitle(pdf, 'Engineering Process', y, '07 — How We Work');
  const process = [
    'Client Consultation',
    'Site Inspection',
    'Engineering Assessment',
    'Solution Design',
    'Quotation & Approval',
    'Supply',
    'Installation',
    'Testing & Commissioning',
    'Training',
    'After-Sales Support',
  ];
  process.forEach((step, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = margin + col * (contentW / 2 + 4);
    const yy = y + row * 14;
    pdf.setFillColor(...BRAND);
    pdf.roundedRect(x, yy - 5, 10, 10, 1.5, 1.5, 'F');
    pdf.setTextColor(...WHITE);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(String(i + 1).padStart(2, '0'), x + 5, yy + 1.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    pdf.text(step, x + 14, yy + 1);
  });

  // ===================== PAGE 8 — INDUSTRIES + BRANDS =====================
  startInnerPage(8, 'Markets');
  y = sectionTitle(pdf, 'Industries We Serve', 36, '08 — Sectors');
  INDUSTRIES.forEach((ind, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (contentW / 3);
    const yy = y + row * 14;
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(x, yy - 5, contentW / 3 - 4, 11, 1.5, 1.5, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ind, x + 4, yy + 2);
  });
  y += 65;

  y = sectionTitle(pdf, 'Brands & Products We Support', y, '09 — Ecosystem');
  y = bodyText(
    pdf,
    'Brands and products we support, supply, service, or work with — subject to availability and applicable manufacturer arrangements. This does not imply authorized distributorship unless formally confirmed.',
    margin,
    y,
    contentW,
    8.5
  );
  y += 4;
  const brands = [
    'Sollant',
    'Atlas Copco',
    'Ingersoll Rand',
    'Kaeser',
    'Festo',
    'SMC',
    'Schneider Electric',
    'ABB',
    'Siemens',
    'SKF',
    'Parker',
    'Donaldson',
  ];
  brands.forEach((b, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = margin + col * (contentW / 4);
    const yy = y + row * 12;
    pdf.setDrawColor(...BRAND);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(x, yy - 5, contentW / 4 - 4, 10, 1.5, 1.5, 'S');
    pdf.setFontSize(8);
    pdf.setTextColor(...DARK);
    pdf.setFont('helvetica', 'bold');
    pdf.text(b, x + (contentW / 4 - 4) / 2, yy + 1.5, { align: 'center' });
  });

  // ===================== PAGE 9 — HSE / QUALITY / SUPPORT =====================
  startInnerPage(9, 'Assurance');
  y = sectionTitle(pdf, 'HSE, Quality & After-Sales', 36, '10 — Trust');

  pdf.setFillColor(...BRAND);
  pdf.roundedRect(margin, y, contentW, 34, 2, 2, 'F');
  pdf.setTextColor(...WHITE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Safety First', margin + 8, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(
    'Safe work practices · Risk assessment · PPE · Environmental responsibility · Equipment safety',
    margin + 8,
    y + 22
  );
  y += 42;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...DARK);
  pdf.text('Quality You Can Trust', margin, y);
  y += 8;
  const qSteps = ['Inspection', 'Testing', 'Installation', 'Documentation', 'Verification'];
  const qw = (contentW - 16) / 5;
  qSteps.forEach((s, i) => {
    const x = margin + i * (qw + 4);
    pdf.setFillColor(i === qSteps.length - 1 ? BRAND[0] : DARK[0], i === qSteps.length - 1 ? BRAND[1] : DARK[1], i === qSteps.length - 1 ? BRAND[2] : DARK[2]);
    pdf.roundedRect(x, y, qw, 16, 1.5, 1.5, 'F');
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(s, x + qw / 2, y + 9.5, { align: 'center' });
    if (i < qSteps.length - 1) {
      pdf.setFillColor(...MUTED);
      pdf.triangle(x + qw + 0.5, y + 6, x + qw + 0.5, y + 10, x + qw + 3, y + 8, 'F');
    }
  });
  y += 28;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...DARK);
  pdf.text('Support Beyond Delivery', margin, y);
  y += 8;
  const lifecycle = ['Supply', 'Install', 'Commission', 'Service', 'Maintain', 'Support'];
  lifecycle.forEach((s, i) => {
    const x = margin + i * (contentW / 6);
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(x + 1, y, contentW / 6 - 4, 18, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...BRAND);
    pdf.text(String(i + 1), x + (contentW / 6 - 4) / 2 + 1, y + 7, { align: 'center' });
    pdf.setTextColor(...DARK);
    pdf.text(s, x + (contentW / 6 - 4) / 2 + 1, y + 13, { align: 'center' });
  });
  y += 28;
  y = bodyText(
    pdf,
    'Routine servicing, emergency repairs, technical consultation, equipment upgrades, original spare parts, and annual maintenance contracts.',
    margin,
    y,
    contentW,
    9
  );

  // ===================== PAGE 10 — PROJECTS / TEAM =====================
  startInnerPage(10, 'Portfolio');
  y = sectionTitle(pdf, 'Projects & Team', 36, '11 — Proof');
  y = bodyText(
    pdf,
    'Real field photography builds trust with procurement managers, factories, and partners. Upload your project and team images in the Profile editor to populate this page.',
    margin,
    y,
    contentW,
    9.5
  );
  y += 4;

  const projects = profile.projectImages || [];
  if (projects.length > 0) {
    const show = Math.min(projects.length, 4);
    const pw2 = (contentW - 6) / 2;
    const ph = 48;
    for (let i = 0; i < show; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + col * (pw2 + 6);
      const yy = y + row * (ph + 12);
      pdf.setFillColor(...LIGHT);
      pdf.roundedRect(x, yy, pw2, ph, 2, 2, 'F');
      safeImage(pdf, projects[i].dataUrl, x + 1.5, yy + 1.5, pw2 - 3, ph - 3);
      if (projects[i].caption) {
        pdf.setFontSize(7);
        pdf.setTextColor(...GRAY);
        pdf.text(projects[i].caption!, x, yy + ph + 5);
      }
    }
    y += Math.ceil(show / 2) * (ph + 12);
  } else {
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(margin, y, contentW, 50, 2, 2, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(...GRAY);
    pdf.text('Upload project photos in Company Profile to showcase SAMIDAK fieldwork here.', margin + 10, y + 28);
    y += 58;
  }

  if (profile.teamImage) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    pdf.text('The People Behind the Solutions', margin, Math.min(y, 210));
    safeImage(pdf, profile.teamImage, margin, Math.min(y + 4, 214), contentW, 42);
  }

  // ===================== PAGE 11 — CORPORATE + CTA =====================
  startInnerPage(11, 'Contact');
  y = sectionTitle(pdf, "Let's Work Together", 36, '12 — Next Step');

  // Contact card
  pdf.setFillColor(...WHITE);
  pdf.setDrawColor(230, 230, 230);
  pdf.roundedRect(margin, y, contentW, 62, 2, 2, 'FD');
  pdf.setFillColor(...BRAND);
  pdf.rect(margin, y, 3, 62, 'F');

  const info = [
    ['Company', settings.name || 'SAMIDAK Technical and Allied Services Nigeria Limited'],
    ['RC Number', settings.regNumber || 'RC 6891936'],
    ['Address', settings.address || 'Lagos, Nigeria'],
    ['Email', contacts.email],
    ['Phone', contacts.phone],
    ['Website', contacts.web],
  ];
  info.forEach(([label, value], i) => {
    const yy = y + 10 + i * 8.5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND);
    pdf.text(label, margin + 10, yy);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...DARK);
    const lines = pdf.splitTextToSize(String(value), contentW - 55);
    pdf.text(lines[0], margin + 42, yy);
  });
  y += 72;

  // CTA banner
  pdf.setFillColor(...BRAND);
  pdf.roundedRect(margin, y, contentW, 48, 2, 2, 'F');
  pdf.setFillColor(10, 10, 10);
  pdf.triangle(pageWidth - margin, y, pageWidth - margin - 40, y, pageWidth - margin, y + 48, 'F');
  pdf.setTextColor(...WHITE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text("LET'S KEEP YOUR OPERATIONS RUNNING.", margin + 8, y + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Equipment  ·  Installation  ·  Maintenance  ·  Repairs  ·  Spare Parts  ·  Support', margin + 8, y + 24);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(`Request a Quote →  ${contacts.web}`, margin + 8, y + 36);
  y += 58;

  // Closing brand lockup
  pdf.setFillColor(...DARK);
  pdf.roundedRect(margin, y, contentW, 36, 2, 2, 'F');
  safeImage(pdf, icon, margin + 8, y + 6, 22, 22);
  if (wordmark) {
    safeImage(pdf, wordmark, margin + 36, y + 8, 70, 18);
  } else {
    pdf.setTextColor(...WHITE);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('SAMIDAK', margin + 36, y + 20);
  }
  pdf.setTextColor(200, 200, 200);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.text('Reliable. Efficient. Professional.', pageWidth - margin - 8, y + 20, {
    align: 'right',
  });

  return pdf;
}

export function downloadCompanyProfilePDF(pdf: jsPDF) {
  pdf.save('SAMIDAK_Company_Profile_2026.pdf');
}

export function profilePdfToBlobUrl(pdf: jsPDF): string {
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
