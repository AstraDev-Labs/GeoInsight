import type { BotSettings } from './types';

export type ModerationLevel = 'clean' | 'violation' | 'severe';

export type ModerationResult = {
    level: ModerationLevel;
    reason?: string;
};

const containsTerm = (text: string, terms: string[]): boolean => {
    const normalized = ` ${text.toLowerCase()} `;
    return terms.some((term) => normalized.includes(` ${term.toLowerCase()} `));
};

const VIOLATION_TERMS = [
    'slur',
    'hate speech',
    'porn',
    'xxx',
    'nude',
    'nsfw',
    'sex video',
    'racist',
];

const SEVERE_TERMS = [
    'child porn',
    'sexual assault',
    'rape',
    'kill yourself',
    'terror attack',
];

export const DEFAULT_BOT_SETTINGS: BotSettings = {
    autoModerationEnabled: true,
    violationTerms: VIOLATION_TERMS,
    severeTerms: SEVERE_TERMS,
    violationMuteHours: 24,
    autoBanOnSevere: true,
};

export const moderateCommentText = (message: string, settings: BotSettings): ModerationResult => {
    if (!settings.autoModerationEnabled) {
        return { level: 'clean' };
    }

    const content = message.trim().toLowerCase();

    if (!content) {
        return { level: 'clean' };
    }

    if (containsTerm(content, settings.severeTerms)) {
        return {
            level: 'severe',
            reason: 'Severe policy violation detected',
        };
    }

    if (containsTerm(content, settings.violationTerms)) {
        return {
            level: 'violation',
            reason: 'Inappropriate or unsafe content detected',
        };
    }

    return { level: 'clean' };
};
