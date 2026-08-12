'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Download, Save, Trash2, Upload, ImagePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AppShell } from '@/components/AppShell';
import { useAppStore } from '@/lib/store';
import { getCompanyProfile, saveCompanyProfile } from '@/lib/db';
import { resizeImageToDataUrl } from '@/lib/image-utils';
import { generateCompanyProfilePDF, downloadCompanyProfilePDF } from '@/lib/profile-pdf';
import type { CompanyProfileContent, ProfileImageSlot } from '@/types';

function ImageUploadCard({
  title,
  hint,
  preview,
  onUpload,
  onRemove,
}: {
  title: string;
  hint: string;
  preview?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-stone-50/80 hover:border-brand-red/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
        </div>
        {preview && onRemove && (
          <button type="button" onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {preview ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gray-100 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-28 rounded-lg bg-white border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
          <ImagePlus className="w-8 h-8" />
        </div>
      )}
      <label className="btn-outline text-xs cursor-pointer w-full">
        <Upload className="w-3.5 h-3.5" />
        {preview ? 'Replace image' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

export default function ProfilePage() {
  const { settings } = useAppStore();
  const [profile, setProfile] = useState<CompanyProfileContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getCompanyProfile()
      .then(setProfile)
      .catch(() => toast.error('Failed to load company profile'));
  }, []);

  const update = (patch: Partial<CompanyProfileContent>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  };

  const handleSingleUpload = async (
    file: File,
    key: 'heroImage' | 'teamImage'
  ) => {
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      update({ [key]: dataUrl });
      toast.success('Image ready');
    } catch {
      toast.error('Could not process image');
    }
  };

  const handleGalleryUpload = async (
    file: File,
    key: 'productImages' | 'projectImages' | 'certImages'
  ) => {
    if (!profile) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const slot: ProfileImageSlot = {
        id: uuidv4(),
        dataUrl,
        caption: file.name.replace(/\.[^.]+$/, ''),
        updatedAt: new Date(),
      };
      update({ [key]: [...(profile[key] || []), slot] });
      toast.success('Image added');
    } catch {
      toast.error('Could not process image');
    }
  };

  const removeGalleryItem = (
    key: 'productImages' | 'projectImages' | 'certImages',
    id: string
  ) => {
    if (!profile) return;
    update({ [key]: profile[key].filter((i) => i.id !== id) });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const saved = await saveCompanyProfile(profile);
      setProfile(saved);
      toast.success('Company profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!profile || !settings) {
      toast.error('Settings and profile are required');
      return;
    }
    setDownloading(true);
    try {
      const saved = await saveCompanyProfile(profile);
      setProfile(saved);
      const pdf = await generateCompanyProfilePDF(settings, saved);
      downloadCompanyProfilePDF(pdf);
      toast.success('Profile PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (!profile) {
    return (
      <AppShell>
        <div className="p-8 text-center text-gray-500">Loading company profile…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red">
              Customer-facing brochure
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Company Profile</h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Edit copy, upload field and product images, then download a branded SAMIDAK profile PDF
              to send with introductions and quotations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Brand strip preview */}
        <div className="card overflow-hidden">
          <div className="bg-brand-red text-white px-5 py-6 flex items-center gap-4">
            <Image src="/logo.png" alt="SAMIDAK" width={56} height={56} className="object-contain bg-white rounded-md p-1" />
            <div>
              <p className="text-xl font-bold tracking-wide">SAMIDAK</p>
              <p className="text-sm text-white/90">
                {settings?.name || 'Technical and Allied Services Nigeria Limited'}
              </p>
              <p className="text-xs italic text-white/80 mt-1">{profile.tagline}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Profile copy</h2>
          <div>
            <label className="label">Tagline</label>
            <input
              className="input"
              value={profile.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Who We Are</label>
            <textarea
              className="input min-h-[100px]"
              rows={4}
              value={profile.whoWeAre}
              onChange={(e) => update({ whoWeAre: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Vision</label>
              <textarea
                className="input min-h-[90px]"
                rows={3}
                value={profile.vision}
                onChange={(e) => update({ vision: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Mission</label>
              <textarea
                className="input min-h-[90px]"
                rows={3}
                value={profile.mission}
                onChange={(e) => update({ mission: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Hero & team images</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ImageUploadCard
              title="Cover / Hero"
              hint="Industrial photo for the brochure cover"
              preview={profile.heroImage}
              onUpload={(f) => handleSingleUpload(f, 'heroImage')}
              onRemove={() => update({ heroImage: undefined })}
            />
            <ImageUploadCard
              title="Team / Facility"
              hint="Used on Who We Are and Team pages"
              preview={profile.teamImage}
              onUpload={(f) => handleSingleUpload(f, 'teamImage')}
              onRemove={() => update({ teamImage: undefined })}
            />
          </div>
        </div>

        {(
          [
            {
              key: 'productImages' as const,
              title: 'Product images',
              hint: 'Equipment and product photography for the portfolio page',
            },
            {
              key: 'projectImages' as const,
              title: 'Project images',
              hint: 'Before / during / after field work photos',
            },
            {
              key: 'certImages' as const,
              title: 'Certificates & documents',
              hint: 'Optional scans of certifications (only include what you hold)',
            },
          ] as const
        ).map((section) => (
          <div key={section.key} className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="text-xs text-gray-500">{section.hint}</p>
              </div>
              <label className="btn-outline text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Add
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGalleryUpload(file, section.key);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {profile[section.key].length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No images yet — upload to enrich the PDF.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile[section.key].map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={img.caption || ''} className="w-full h-32 object-cover" />
                    <div className="p-2 flex items-center justify-between gap-2">
                      <input
                        className="input py-1 text-xs"
                        value={img.caption || ''}
                        onChange={(e) => {
                          update({
                            [section.key]: profile[section.key].map((i) =>
                              i.id === img.id ? { ...i, caption: e.target.value } : i
                            ),
                          });
                        }}
                        placeholder="Caption"
                      />
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-red-600"
                        onClick={() => removeGalleryItem(section.key, img.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="card p-5 bg-gradient-to-br from-stone-50 to-white">
          <h2 className="text-lg font-semibold mb-2">PDF includes</h2>
          <ol className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Cover with brand & hero</li>
            <li>Who We Are</li>
            <li>Vision, Mission & Values</li>
            <li>Why SAMIDAK</li>
            <li>Engineering Services</li>
            <li>Product Portfolio</li>
            <li>Compressed Air & Process</li>
            <li>Industries & Brands</li>
            <li>HSE, Quality & After-sales</li>
            <li>Projects & Team</li>
            <li>Corporate info & CTA</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            Contact details are pulled from Settings ({settings?.email || 'info@samidakservices.com'} ·{' '}
            {settings?.website || 'www.samidakservices.com'}).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
