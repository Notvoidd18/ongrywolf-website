'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Terminal } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    contactName: '',
    contactMethod: '',
    category: 'plugins',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccessId(data.requestId);
      setFormData({
        contactName: '',
        contactMethod: '',
        category: 'plugins',
        description: '',
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 bg-[#06090F]">
      <div className="space-y-4 max-w-2xl">
        <Badge variant="blue">ENGAGEMENT & COMMISSIONS</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Initiate a Project Request
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Submit your technical specifications or feature requirements. Submissions are saved directly to our review pipeline and answered by lead developers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <Card className="p-8">
            {successId ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Project Request Recorded</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your project inquiry has been logged under reference{' '}
                  <span className="font-mono text-brand-300 font-semibold">{successId}</span>.
                  Our team will contact you via your specified communication handle.
                </p>
                <div className="pt-4">
                  <Button variant="secondary" onClick={() => setSuccessId(null)}>
                    Submit Another Request
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-md bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Name or Discord Handle *"
                  name="contactName"
                  placeholder="e.g. VoidWolf#0001 or @voidwolf"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />

                <Input
                  label="Preferred Contact Channel *"
                  name="contactMethod"
                  placeholder="Discord Username, Email, or Telegram"
                  value={formData.contactMethod}
                  onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Project Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-surface-subtle border border-surface-border rounded-md px-3.5 py-2 text-sm text-slate-100 transition-colors focus:outline-none focus:border-brand-500 font-mono text-xs"
                  >
                    <option value="plugins">Minecraft Plugins & Custom Mobs</option>
                    <option value="discord-bots">Discord Bots & Multi-Bot Platform</option>
                    <option value="client">Custom Minecraft Client Modules</option>
                    <option value="builds">High-Quality Builds & Schematics</option>
                    <option value="full-stack">Full-Stack Server Ecosystem</option>
                  </select>
                </div>

                <Textarea
                  label="Technical Scope & Details *"
                  name="description"
                  placeholder="Describe your server version, required commands or mob behaviors, deadline, and architectural requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />

                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  <span>Submit Specification</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6">
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-brand-400 font-mono text-xs font-semibold uppercase">
              <Terminal className="w-4 h-4" />
              Direct Standards
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                • Detailed mechanical specifications receive priority review and scoping estimates within 24 hours.
              </p>
              <p>
                • Custom builds and plugin deliverables include automated verification tests and schematics.
              </p>
              <p>
                • Free bot users configure self-hosted setups directly through the Bot Dashboard.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
