'use client';

import { useEffect, useState } from 'react';
import type { BotSettings } from '@/lib/types';

const FALLBACK_SETTINGS: BotSettings = {
    autoModerationEnabled: true,
    violationTerms: ['slur', 'hate speech', 'porn', 'xxx', 'nude', 'nsfw', 'sex video', 'racist'],
    severeTerms: ['child porn', 'sexual assault', 'rape', 'kill yourself', 'terror attack'],
    violationMuteHours: 24,
    autoBanOnSevere: true,
};

type Props = {
    canEdit: boolean;
};

export default function BotSettingsPanel({ canEdit }: Props) {
    const [settings, setSettings] = useState<BotSettings>(FALLBACK_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/admin/bot-settings', { cache: 'no-store' });
                if (!res.ok) {
                    setError('Failed to load bot settings');
                    return;
                }

                const data = await res.json() as BotSettings;
                setSettings(data);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const save = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/admin/bot-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            const data = await res.json() as BotSettings | { error?: string };
            if (!res.ok) {
                setError((data as { error?: string }).error || 'Failed to save bot settings');
                return;
            }

            const updated = data as BotSettings;
            setSettings(updated);
            setMessage('Bot settings saved successfully.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 mb-10">
                <div className="text-sm text-[#666]">Loading bot settings...</div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold text-[#222]">AutoMod Bot Settings</h3>
                    <p className="text-sm text-[#666] mt-1">Configure automated comment moderation rules and enforcement.</p>
                </div>
                <button
                    onClick={() => void save()}
                    disabled={!canEdit || saving}
                    className="px-4 py-2 rounded-xl bg-[#006699] text-white font-semibold text-sm disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm text-[#222] font-medium">
                    <input
                        type="checkbox"
                        checked={settings.autoModerationEnabled}
                        onChange={(event) => setSettings((prev) => ({ ...prev, autoModerationEnabled: event.target.checked }))}
                        disabled={!canEdit}
                    />
                    Enable auto moderation
                </label>

                <label className="flex items-center gap-2 text-sm text-[#222] font-medium">
                    <input
                        type="checkbox"
                        checked={settings.autoBanOnSevere}
                        onChange={(event) => setSettings((prev) => ({ ...prev, autoBanOnSevere: event.target.checked }))}
                        disabled={!canEdit}
                    />
                    Auto-ban on severe violations
                </label>

                <label className="text-sm text-[#222] font-medium">
                    Mute duration (hours)
                    <input
                        type="number"
                        min={1}
                        max={168}
                        value={settings.violationMuteHours}
                        onChange={(event) =>
                            setSettings((prev) => ({
                                ...prev,
                                violationMuteHours: Math.max(1, Number(event.target.value) || 1),
                            }))
                        }
                        disabled={!canEdit}
                        className="mt-2 w-full bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm"
                    />
                </label>
            </div>

            <div className="text-xs text-[#666]">
                Violation/severe keyword lists are managed internally and hidden from this panel.
            </div>

            {message && <div className="mt-4 text-sm text-secondary">{message}</div>}
            {error && <div className="mt-4 text-sm text-destructive">{error}</div>}
        </div>
    );
}
