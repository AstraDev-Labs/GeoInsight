'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ar';

interface Translations {
    [key: string]: Record<Language, string>;
}

export const translations = {
    missionFeed: {
        en: 'Mission Intelligence Feed',
        es: 'Flujo de Inteligencia de Misión',
        fr: 'Flux d\'Intelligence de Mission',
        de: 'Mission Intelligence-Feed',
        ar: 'موجز استخبارات المهمة',
    },
    researchFindings: {
        en: 'Research Findings',
        es: 'Resultados de Investigación',
        fr: 'Résultats de Recherche',
        de: 'Forschungsergebnisse',
        ar: 'نتائج البحث',
    },
    collaborationDesc: {
        en: 'A collaborative intelligence space for remote sensing peers to share findings, analyze satellite telemetry, and explore Earth observation research.',
        es: 'Un espacio de inteligencia colaborativa para colegas de teledetección para compartir hallazgos, analizar telemetría satelital y explorar investigaciones de observación de la Tierra.',
        fr: 'Un espace d\'intelligence collaborative pour les pairs de la télédétection afin de partager des découvertes, analyser la télémétrie par satellite et explorer la recherche sur l\'observation de la Terre.',
        de: 'Ein kollaborativer Intelligenzraum für Fernerkundungskollegen, um Ergebnisse auszutauschen, Satellitentelemetrie zu analysieren und Erdforschungsforschung zu betreiben.',
        ar: 'مساحة استخباراتية تعاونية لأقران الاستشعار عن بعد لمشاركة النتائج وتحليل القياس عن بعد عبر الأقمار الصناعية واستكشاف أبحاث مراقبة الأرض.',
    },
    telemetryStream: {
        en: 'Telemetry Stream',
        es: 'Transmisión de Telemetría',
        fr: 'Flux de Télémétrie',
        de: 'Telemetrie-Stream',
        ar: 'تدفق القياس عن بعد',
    },
    searchPlaceholder: {
        en: 'Search missions, locations, or sensors...',
        es: 'Buscar misiones, ubicaciones o sensores...',
        fr: 'Rechercher des missions, des lieux ou des capteurs...',
        de: 'Suche nach Missionen, Orten oder Sensoren...',
        ar: 'البحث عن المهمات، المواقع، أو أجهزة الاستشعار...',
    },
    allIntelligence: {
        en: 'All Intelligence',
        es: 'Toda la Inteligencia',
        fr: 'Toute l\'Intelligence',
        de: 'Alle Informationen',
        ar: 'كل الاستخبارات',
    },
    noMissions: {
        en: 'No missions reported yet.',
        es: 'Aún no se han reportado misiones.',
        fr: 'Aucune mission signalée pour le moment.',
        de: 'Noch keine Missionen gemeldet.',
        ar: 'لم يتم الإبلاغ عن أي مهمات بعد.',
    },
    beTheFirst: {
        en: 'Incoming telemetry requested. Be the first to submit a report.',
        es: 'Telemetría entrante requerida. Sé el primero en enviar un informe.',
        fr: 'Télémétrie entrante demandée. Soyez le premier à soumettre un rapport.',
        de: 'Eingehende Telemetrie angefordert. Seien Sie der Erste, der einen Bericht einreicht.',
        ar: 'القياس عن بعد الوارد مطلوب. كن أول من يقدم تقريراً.',
    },
    accessFile: {
        en: 'Access File',
        es: 'Acceder al Archivo',
        fr: 'Accéder au Fichier',
        de: 'Datei aufrufen',
        ar: 'الوصول إلى الملف',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['en', 'es', 'fr', 'de', 'ar'].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: keyof typeof translations) => {
        return translations[key]?.[language] || translations[key]?.['en'] || key;
    };

    const isRTL = language === 'ar';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
