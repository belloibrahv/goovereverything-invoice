'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Copy, Search, Mail, Check } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAppStore } from '@/lib/store';
import {
  EMAIL_CATEGORIES,
  EMAIL_TEMPLATES,
  CTA_LIBRARY,
  SUBJECT_LIBRARY,
  applyMergeFields,
  type EmailCategory,
  type EmailTemplate,
  type MergeFields,
} from '@/lib/email-templates';
import { cn } from '@/lib/utils';

const FIELD_LABELS: Record<string, string> = {
  recipientName: "Recipient's Name",
  senderName: 'Your Full Name',
  jobTitle: 'Your Job Title',
  company: 'Company Name',
  product: 'Product / Service / Equipment',
  reference: 'Reference Number',
  projectName: 'Project Name',
  equipment: 'Equipment',
  amount: 'Amount',
  dueDate: 'Due Date',
  proposedDate: 'Proposed Date',
  currentStage: 'Current Stage',
  completedWork: 'Completed Work',
  workInProgress: 'Work In Progress',
  nextWork: 'Next Step',
  timeline: 'Timeline',
  workPerformed: 'Work Performed',
  findings: 'Findings',
  recommendations: 'Recommendations',
  nextMaintenanceDate: 'Next Maintenance Date',
  engineerName: 'Engineer Name',
  nextSteps: 'Next Steps',
  requiredDocuments: 'Required Documents',
  location: 'Location / Mode',
};

const emptyFields = (): MergeFields => ({
  recipientName: '',
  senderName: '',
  jobTitle: '',
  company: '',
  product: '',
  reference: '',
  projectName: '',
  equipment: '',
  amount: '',
  dueDate: '',
  proposedDate: '',
  currentStage: '',
  completedWork: '',
  workInProgress: '',
  nextWork: '',
  timeline: '',
  workPerformed: '',
  findings: '',
  recommendations: '',
  nextMaintenanceDate: '',
  engineerName: '',
  nextSteps: '',
  requiredDocuments: '',
  location: '',
  segmentFocus: '',
});

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied — paste into your email`);
  } catch {
    toast.error('Could not copy to clipboard');
  }
}

/** Copy rich HTML that pastes cleanly into Gmail / Outlook compose. */
async function copyRichForEmail(htmlFragment: string, plainText: string) {
  // Preferred for Gmail: select a hidden rich node and execCommand('copy')
  try {
    const host = document.createElement('div');
    host.setAttribute('contenteditable', 'true');
    host.innerHTML = htmlFragment;
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.top = '0';
    document.body.appendChild(host);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(host);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const ok = document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(host);

    if (ok) {
      toast.success('Email copied — paste into Gmail / Outlook compose');
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    if (typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlFragment], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      toast.success('Email copied — paste into Gmail / Outlook compose');
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    await navigator.clipboard.writeText(plainText);
    toast.success('Plain email copied — paste into your mail');
  } catch {
    toast.error('Could not copy email');
  }
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Paste-ready fragment (no localhost images) for Gmail/Outlook. */
function buildPasteableEmailHtml(opts: {
  body: string;
  cta?: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
}) {
  const paragraphs = opts.body
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '<div style="height:10px;line-height:10px;">&nbsp;</div>';
      return `<p style="margin:0 0 10px 0;padding:0;line-height:1.55;color:#1f2937;font-size:14px;font-family:Segoe UI,Arial,sans-serif;">${escapeHtml(line)}</p>`;
    })
    .join('');

  const ctaBlock = opts.cta
    ? `<div style="margin:18px 0;padding:12px 14px;border-left:4px solid #a10409;background:#faf5f5;">
        ${opts.cta
          .split('\n')
          .map(
            (l) =>
              `<p style="margin:0 0 6px 0;color:#1f2937;font-size:13px;line-height:1.5;font-family:Segoe UI,Arial,sans-serif;">${escapeHtml(l)}</p>`
          )
          .join('')}
      </div>`
    : '';

  return `<div style="font-family:Segoe UI,Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.55;max-width:640px;">
  <div style="border-top:4px solid #a10409;padding-top:14px;margin-bottom:18px;">
    <p style="margin:0;font-size:20px;font-weight:700;color:#a10409;letter-spacing:0.04em;">SAMIDAK</p>
    <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">${escapeHtml(opts.companyName)}</p>
    <p style="margin:4px 0 0 0;font-size:12px;color:#a10409;font-style:italic;">Powering Industry. Delivering Value.</p>
  </div>
  ${paragraphs}
  ${ctaBlock}
  <div style="margin-top:22px;padding-top:14px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">SAMIDAK Technical and Allied Services Nigeria Limited</p>
    <p style="margin:6px 0 0 0;font-size:12px;color:#4b5563;">📧 ${escapeHtml(opts.email)}</p>
    <p style="margin:2px 0 0 0;font-size:12px;color:#4b5563;">📞 ${escapeHtml(opts.phone)}</p>
    <p style="margin:2px 0 0 0;font-size:12px;color:#a10409;">🌐 ${escapeHtml(opts.website)}</p>
  </div>
</div>`;
}

function buildPlainEmail(opts: { body: string; cta?: string; email: string; phone: string; website: string }) {
  const parts = [opts.body.trim()];
  if (opts.cta?.trim()) parts.push('', opts.cta.trim());
  parts.push(
    '',
    '—',
    'SAMIDAK Technical and Allied Services Nigeria Limited',
    opts.email,
    opts.phone,
    opts.website
  );
  return parts.join('\n');
}

export default function EmailsPage() {
  const { settings } = useAppStore();
  const [category, setCategory] = useState<EmailCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATES[0].id);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [segmentId, setSegmentId] = useState<string>('');
  const [fields, setFields] = useState<MergeFields>(emptyFields);
  const [showResources, setShowResources] = useState(false);

  const selected: EmailTemplate =
    EMAIL_TEMPLATES.find((t) => t.id === selectedId) || EMAIL_TEMPLATES[0];

  const filtered = useMemo(() => {
    return EMAIL_TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [category, search]);

  const mergeFields = useMemo(() => {
    const next = { ...fields };
    if (selected.segments && segmentId) {
      const seg = selected.segments.find((s) => s.id === segmentId);
      if (seg) {
        next.segmentFocus = `${seg.focusLine}\n\nFocus areas for ${seg.label}:\n${seg.servicesFocus
          .map((s) => `• ${s}`)
          .join('\n')}`;
      }
    } else {
      next.segmentFocus = '';
    }
    return next;
  }, [fields, selected, segmentId]);

  const subject = applyMergeFields(
    selected.subjects[Math.min(subjectIndex, selected.subjects.length - 1)] || '',
    mergeFields
  );
  const body = applyMergeFields(selected.body, mergeFields);
  const cta = selected.cta ? applyMergeFields(selected.cta, mergeFields) : undefined;

  const companyName = settings?.name || 'SAMIDAK Technical and Allied Services Nigeria Limited';
  const email = settings?.email || 'info@samidakservices.com';
  const phone = settings?.phone || '+234 816 236 8769';
  const website = settings?.website || 'www.samidakservices.com';

  const pasteHtml = buildPasteableEmailHtml({
    body,
    cta,
    companyName,
    email,
    phone,
    website,
  });
  const plainEmail = buildPlainEmail({ body, cta, email, phone, website });

  const copyEmailToPaste = () => copyRichForEmail(pasteHtml, plainEmail);

  const selectTemplate = (t: EmailTemplate) => {
    setSelectedId(t.id);
    setSubjectIndex(0);
    setSegmentId('');
    setShowResources(false);
  };

  return (
    <AppShell>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red">
              Corporate Communication
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Email Templates</h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Select a mail type, fill in the details, then copy a professional branded email for
              outreach, sales, projects, and support.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResources((v) => !v)}
            className="btn-outline text-sm"
          >
            <Mail className="w-4 h-4" />
            {showResources ? 'Hide' : 'Show'} CTA & Subject Libraries
          </button>
        </div>

        {showResources && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Approved CTAs</h3>
              <ul className="space-y-2">
                {CTA_LIBRARY.map((ctaItem) => (
                  <li key={ctaItem} className="flex items-start justify-between gap-2 text-sm text-gray-700">
                    <span>{ctaItem}</span>
                    <button
                      type="button"
                      className="text-brand-red hover:underline shrink-0"
                      onClick={() => copyText(ctaItem, 'CTA')}
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Subject Patterns</h3>
              <ul className="space-y-2">
                {SUBJECT_LIBRARY.map((s) => (
                  <li key={s} className="flex items-start justify-between gap-2 text-sm text-gray-700">
                    <span>{s}</span>
                    <button
                      type="button"
                      className="text-brand-red hover:underline shrink-0"
                      onClick={() => copyText(s, 'Subject')}
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-4 min-h-[70vh]">
          {/* Template list */}
          <aside className="lg:col-span-4 card p-3 md:p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium border',
                  category === 'all'
                    ? 'bg-brand-red text-white border-brand-red'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red/40'
                )}
              >
                All
              </button>
              {EMAIL_CATEGORIES.filter((c) => c.id !== 'resources').map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    category === c.id
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red/40'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[58vh] space-y-1 pr-1">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTemplate(t)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
                    selectedId === t.id
                      ? 'border-brand-red bg-red-50 shadow-sm'
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  )}
                >
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{t.purpose}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-500 p-3">No templates match your search.</p>
              )}
            </div>
          </aside>

          {/* Detail + preview */}
          <section className="lg:col-span-8 space-y-4">
            <div className="card p-4 md:p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-red font-semibold">
                  {EMAIL_CATEGORIES.find((c) => c.id === selected.category)?.label}
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{selected.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selected.purpose}</p>
                {selected.attachmentHint && (
                  <p className="text-xs text-gray-500 mt-2">
                    Suggested attachment: <span className="font-medium">{selected.attachmentHint}</span>
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject line</label>
                  <select
                    className="input"
                    value={subjectIndex}
                    onChange={(e) => setSubjectIndex(Number(e.target.value))}
                  >
                    {selected.subjects.map((s, i) => (
                      <option key={s} value={i}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {selected.segments && (
                  <div>
                    <label className="label">Industry segment (optional)</label>
                    <select
                      className="input"
                      value={segmentId}
                      onChange={(e) => setSegmentId(e.target.value)}
                    >
                      <option value="">General (default services list)</option>
                      {selected.segments.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {(selected.fields || ['recipientName', 'senderName', 'jobTitle']).map((key) => (
                  <div key={key}>
                    <label className="label">{FIELD_LABELS[key] || key}</label>
                    <input
                      className="input"
                      value={fields[key] || ''}
                      onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                      placeholder={FIELD_LABELS[key]}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-brand-red/20 bg-red-50/50 px-3 py-3 space-y-2">
                <p className="text-xs font-semibold text-brand-red uppercase tracking-wide">
                  Paste into your mail app
                </p>
                <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
                  <li>Copy the subject line</li>
                  <li>Copy the email message</li>
                  <li>Open Gmail / Outlook → New message → paste subject, then paste the body</li>
                </ol>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => copyText(subject, 'Subject')}
                >
                  <Copy className="w-4 h-4" /> 1. Copy Subject
                </button>
                <button type="button" className="btn-primary" onClick={copyEmailToPaste}>
                  <Check className="w-4 h-4" /> 2. Copy Email to Paste
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => copyText(plainEmail, 'Plain text email')}
                >
                  <Copy className="w-4 h-4" /> Copy as Plain Text
                </button>
                {cta && (
                  <button type="button" className="btn-outline" onClick={() => copyText(cta, 'CTA')}>
                    <Copy className="w-4 h-4" /> Copy CTA only
                  </button>
                )}
              </div>
            </div>

            {/* Branded preview */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Professional preview</p>
                <p className="text-xs text-gray-500">
                  Use “Copy Email to Paste”, then paste into Gmail / Outlook
                </p>
              </div>
              <div className="bg-gradient-to-b from-stone-200/80 to-stone-100 p-4 md:p-8">
                <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="h-1.5 bg-brand-red" />
                  <div className="px-6 py-5 border-b border-red-50 bg-gradient-to-b from-white to-red-50/40 flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="SAMIDAK"
                      width={52}
                      height={52}
                      className="object-contain rounded-lg"
                    />
                    <div className="min-w-0">
                      <div className="inline-flex items-center rounded-md bg-gray-900 px-2.5 py-1.5">
                        <Image
                          src="/samidak-logo.png"
                          alt="SAMIDAK wordmark"
                          width={140}
                          height={28}
                          className="object-contain h-7 w-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mt-2 truncate">
                        {settings?.name || 'SAMIDAK Technical and Allied Services Nigeria Limited'}
                      </p>
                      <p className="text-xs text-brand-red italic mt-0.5">
                        Powering Industry. Delivering Value.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pt-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Subject</p>
                    <p className="text-base font-semibold text-gray-900 mt-1 mb-4">{subject}</p>
                  </div>
                  <div className="px-6 pb-6 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {body}
                  </div>
                  {cta && (
                    <div className="mx-6 mb-6 px-4 py-3 border-l-4 border-brand-red bg-red-50/60 whitespace-pre-wrap text-sm text-gray-800 rounded-r-lg">
                      {cta}
                    </div>
                  )}
                  <div className="px-6 py-4 bg-gray-900 text-white flex items-start gap-3">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={28}
                      height={28}
                      className="object-contain rounded bg-white p-0.5"
                    />
                    <div>
                      <p className="text-xs font-semibold">
                        SAMIDAK Technical and Allied Services Nigeria Limited
                      </p>
                      <p className="text-[11px] text-gray-300 mt-1">
                        {settings?.email || 'info@samidakservices.com'} ·{' '}
                        {settings?.phone || '+234 816 236 8769'}
                      </p>
                      <p className="text-[11px] text-red-300 mt-0.5">
                        {settings?.website || 'www.samidakservices.com'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
