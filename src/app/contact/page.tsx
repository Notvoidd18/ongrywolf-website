'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  Cpu,
  Clock,
  Sparkles,
  Layers,
  Send,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getPersistentClientId } from '@/lib/clientId';

export default function ContactPage() {
  const [clientId, setClientId] = useState<string>('OW-....');
  const [formData, setFormData] = useState({
    contactName: '',
    contactMethod: '',
    category: 'plugins' as const,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    requestId: string;
    clientId: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  useEffect(() => {
    const id = getPersistentClientId();
    setClientId(id);
  }, []);

  const handleCopyId = () => {
    const target = submissionReceipt?.clientId || clientId;
    navigator.clipboard.writeText(target);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handleCopySlip = () => {
    if (!submissionReceipt) return;
    const slip = `[Ongrywolf Project Request Verification]
Client ID: ${submissionReceipt.clientId}
Request Ref: #${submissionReceipt.requestId}
Category: ${formData.category}
Contact: ${formData.contactMethod}
Status: Queued for Lead Engineer Review (SLA: Under 1 hour)
Verified at: ${new Date().toUTCString()}`;
    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const activeClientId = clientId.startsWith('OW-') && !clientId.includes('.')
        ? clientId
        : getPersistentClientId();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientId: activeClientId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit project specification');
      }

      setSubmissionReceipt({
        requestId: String(data.requestId),
        clientId: data.clientId || activeClientId,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmissionReceipt(null);
    setFormData({
      contactName: '',
      contactMethod: '',
      category: 'plugins',
      description: '',
    });
  };

  return (
    <div className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10 bg-[#06090F]">
      {/* Header section with Client ID Capsule */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border/60">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="blue" className="text-[10px] uppercase font-mono tracking-wider">
              ENTERPRISE COMMISSIONS & BOT SUITE
            </Badge>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SLA: 1-Hour Review
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Initiate a Project Request
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Direct intake for custom Minecraft plugins, multi-bot orchestration, and high-performance server architecture. Each client is permanently tied to a unique verified Client ID.
          </p>
        </div>

        {/* User Identity Pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle/80 border border-brand-500/20 backdrop-blur-sm self-start md:self-auto shadow-lg shadow-black/40">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Your Unique Client ID</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-brand-300 tracking-wider">
                {clientId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-surface"
                title="Copy Client ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8 bg-surface/90 border-surface-border/80 backdrop-blur-md relative overflow-hidden">
            {/* Holographic background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            {submissionReceipt ? (
              /* Cool Smooth Animated Submission Receipt */
              <div className="py-6 sm:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <Badge variant="emerald" className="font-mono text-[10px] uppercase tracking-wider">
                    TRANSMISSION VERIFIED
                  </Badge>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Project Request Successfully Recorded
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Your request has been routed to our lead engineering review queue. Keep your Client ID handy for all future inquiries and updates.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-surface-subtle to-surface border border-brand-500/30 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Deterministic Client ID</div>
                      <div className="font-mono text-2xl font-black text-brand-300 tracking-wider">
                        {submissionReceipt.clientId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyId}
                        className="font-mono text-xs gap-1.5 h-8"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopySlip}
                        className="font-mono text-xs gap-1.5 h-8 text-brand-300 border-brand-500/30 hover:border-brand-500/60"
                      >
                        {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{copiedSlip ? 'Slip Copied' : 'Copy Slip'}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface/80 border border-surface-border">
                      <div className="text-[10px] text-slate-400 font-mono">Reference Ticket</div>
                      <div className="font-mono font-bold text-white text-xs truncate">
                        #{submissionReceipt.requestId}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/80 border border-surface-border">
                      <div className="text-[10px] text-slate-400 font-mono">Guaranteed SLA</div>
                      <div className="font-semibold text-emerald-400 text-xs">Under 1 Hour Review</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/80 border border-surface-border col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 font-mono">Primary Channel</div>
                      <div className="font-mono text-slate-200 text-xs truncate">
                        {formData.contactMethod || 'Direct Handle'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <Button variant="secondary" onClick={handleReset} className="text-xs">
                    Submit Another Project Specification
                  </Button>
                </div>
              </div>
            ) : (
              /* Professional Contact Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Client Name or Alias *"
                    name="contactName"
                    placeholder="e.g. VoidWolf or Studio Lead"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    required
                  />

                  <Input
                    label="Direct Contact Method *"
                    name="contactMethod"
                    placeholder="Discord (@handle) or Business Email"
                    value={formData.contactMethod}
                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Project Architecture Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-surface-subtle border border-surface-border rounded-md px-3.5 py-2.5 text-xs text-slate-100 font-mono transition-colors focus:outline-none focus:border-brand-500"
                  >
                    <option value="plugins">⚡ Minecraft Custom Plugins & Spigot/Paper Core</option>
                    <option value="discord-bots">🤖 Dedicated Discord Bot Hosting & Multi-Tenant Platform</option>
                    <option value="client">🛡️ Custom Client Modules & Security Hardening</option>
                    <option value="builds">🏰 Custom Map Schematics & World Generation</option>
                    <option value="full-stack">🌐 Full-Stack Server Infrastructure & Web Suite</option>
                  </select>
                </div>

                <Textarea
                  label="Technical Scope & Deliverable Requirements *"
                  name="description"
                  placeholder="Detail your operational requirements (e.g. version targets, required commands, expected traffic/concurrency, deadline targets, and custom logic)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-sm font-semibold tracking-wide"
                    isLoading={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>Transmit Specification to Lead Engineer</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar Info & SLA Guarantees */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-surface border-surface-border space-y-3">
            <div className="flex items-center gap-2 text-brand-400 font-mono text-xs font-semibold uppercase">
              <Terminal className="w-4 h-4" />
              Engineering Intake Protocol
            </div>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">1-Hour Initial Review:</strong> Requests are assigned immediately to our lead engineer for technical viability.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Deterministic ID:</strong> Your Client ID (<code className="text-brand-300 font-bold">{clientId}</code>) stays consistent across all inquiries.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Production Deliverables:</strong> All projects include compile pipelines, automated integration checks, and support.
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-surface-subtle border-surface-border space-y-2">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Bot Dashboard Direct Access
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Already have an active Discord bot or looking to manage your live instance? Head directly to our real-time bot management center.
            </p>
            <div className="pt-1">
              <a
                href="/dashboard/bots"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <span>Launch Bot Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}