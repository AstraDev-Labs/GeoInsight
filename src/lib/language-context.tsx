'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', native: 'ไทย' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'sv', name: 'Swedish', native: 'Svenska' },
    { code: 'no', name: 'Norwegian', native: 'Norsk' },
    { code: 'fi', name: 'Finnish', native: 'Suomi' },
    { code: 'da', name: 'Danish', native: 'Dansk' },
    { code: 'he', name: 'Hebrew', native: 'עברית' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά' },
    { code: 'cs', name: 'Czech', native: 'Čeština' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar' },
    { code: 'ro', name: 'Romanian', native: 'Română' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'fa', name: 'Persian', native: 'فارسی' },
] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number]['code'] | string;

interface Translations {
    [key: string]: Record<string, string>;
}

export const translations = {
    branding: {
        en: 'Remote Sensing & GIS Intelligence',
        es: 'Inteligencia de Teledetección y SIG',
        fr: 'Intelligence en Télédétection et SIG',
        de: 'Fernerkundung & GIS Intelligenz',
        ar: 'استخبارات الاستشعار عن بعد ونظم المعلومات الجغرافية',
        hi: 'रिमोट सेंसिंग और जीआईएस इंटेलिजेंस',
        zh: '遥感与 GIS 情报',
    },
    missionFeed: {
        en: 'Mission Intelligence Feed',
        es: 'Flujo de Inteligencia de Misión',
        fr: 'Flux d\'Intelligence de Mission',
        de: 'Mission Intelligence-Feed',
        ar: 'موجز استخبارات المهمة',
        hi: 'मिशन इंटेलिजेंस फीड',
        zh: '任务情报提要',
    },
    researchFindings: {
        en: 'Research Findings',
        es: 'Resultados de Investigación',
        fr: 'Résultats de Recherche',
        de: 'Forschungsergebnisse',
        ar: 'نتائج البحث',
        hi: 'अनुसंधान निष्कर्ष',
        zh: '研究结果',
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
    legal: {
        en: 'Legal',
        es: 'Legal',
        fr: 'Juridique',
        de: 'Rechtliches',
        ar: 'قانوني',
    },
    platform: {
        en: 'Platform',
        es: 'Plataforma',
        fr: 'Plateforme',
        de: 'Plattform',
        ar: 'المنصة',
    },
    home: {
        en: 'Home',
        es: 'Inicio',
        fr: 'Accueil',
        de: 'Startseite',
        ar: 'الرئيسية',
        hi: 'मुख्य पृष्ठ',
        zh: '首页',
        ja: 'ホーム',
        ru: 'Главная',
        pt: 'Início',
        it: 'Home',
    },
    categories: {
        en: 'Categories',
        es: 'Categorías',
        fr: 'Catégories',
        de: 'Kategorien',
        ar: 'التصنيفات',
        hi: 'श्रेणियां',
        zh: '类别',
        ja: 'カテゴリー',
        ru: 'Категории',
        pt: 'Categorias',
        it: 'Categorie',
    },
    submitReport: {
        en: 'Submit Report',
        es: 'Enviar Informe',
        fr: 'Soumettre un Rapport',
        de: 'Bericht einreichen',
        ar: 'تقديم تقرير',
        hi: 'रिपोर्ट जमा करें',
        zh: '提交报告',
        ja: 'レポートを提出',
        ru: 'Отправить отчет',
        pt: 'Enviar Relatório',
        it: 'Invia Rapporto',
    },
    adminPortal: {
        en: 'Admin Portal',
        es: 'Portal de Administración',
        fr: 'Portail Admin',
        de: 'Admin-Portal',
        ar: 'بوابة المسؤول',
        hi: 'व्यवस्थापक पोर्टल',
        zh: '管理后台',
        ja: '管理者ポータル',
        ru: 'Портал администратора',
        pt: 'Portal Administrativo',
        it: 'Portale Amministratore',
    },
    privacyPolicy: {
        en: 'Privacy Policy',
        es: 'Política de Privacidad',
        fr: 'Politique de Confidentialité',
        de: 'Datenschutzerklärung',
        ar: 'سياسة الخصوصية',
    },
    termsOfService: {
        en: 'Terms of Service',
        es: 'Términos de Servicio',
        fr: 'Conditions d\'Utilisation',
        de: 'Nutzungsbedingungen',
        ar: 'شروط الخدمة',
    },
    support: {
        en: 'Support',
        es: 'Soporte',
        fr: 'Support',
        de: 'Support',
        ar: 'الدعم',
    },
    submitResearch: {
        en: 'Submit Research',
        es: 'Enviar Investigación',
        fr: 'Soumettre la Recherche',
        de: 'Forschung Einreichen',
        ar: 'تقديم البحث',
    },
    builtForEO: {
        en: 'Built for Earth Observation',
        es: 'Construido para la Observación de la Tierra',
        fr: 'Conçu pour l\'Observation de la Terre',
        de: 'Entwickelt für die Erdbeobachtung',
        ar: 'بني لمراقبة الأرض',
    },
    footerDesc: {
        en: 'A collaborative intelligence platform for remote sensing peers to explore, analyze, and share Earth observation findings.',
        es: 'Una plataforma de inteligencia colaborativa para colegas de teledetección para explorar, analizar y compartir hallazgos de observación de la Tierra.',
        fr: 'Une plateforme d\'intelligence collaborative pour les pairs de la télédétection afin d\'explorer, d\'analyser et de partager des découvertes sur l\'observation de la Terre.',
        de: 'Eine kollaborative Intelligenzplattform für Fernerkundungskollegen zum Erkunden, Analysieren und Teilen von Erdbeobachtungsergebnissen.',
        ar: 'منصة استخباراتية تعاونية لأقران الاستشعار عن بعد لاستكشاف وتحليل ومشاركة نتائج مراقبة الأرض.',
    },
    lastUpdated: {
        en: 'Page Last Updated',
        es: 'Página Última Actualización',
        fr: 'Dernière Mise à Jour de la Page',
        de: 'Seite zuletzt aktualisiert',
        ar: 'آخر تحديث للصفحة',
    },
    pageEditor: {
        en: 'Page Editor',
        es: 'Editor de Página',
        fr: 'Éditeur de Page',
        de: 'Seiten-Editor',
        ar: 'محرر الصفحة',
    },
    responsibleOfficial: {
        en: 'Responsible Official for Science',
        es: 'Oficial Responsable de Ciencia',
        fr: 'Responsable Scientifique',
        de: 'Verantwortlicher für Wissenschaft',
        ar: 'المسؤول عن العلوم',
    },
    intelligenceBoard: {
        en: 'GeoInsights Intelligence Board',
        es: 'Junta de Inteligencia de GeoInsights',
        fr: 'Conseil d\'Intelligence GeoInsights',
        de: 'GeoInsights Intelligence Board',
        ar: 'مجلس استخبارات GeoInsights',
    },
    new: {
        en: 'New',
        es: 'Nuevo',
        fr: 'Nouveau',
        de: 'Neu',
        ar: 'جديد',
    },
    intelligenceUplink: {
        en: 'Intelligence Uplink',
        es: 'Enlace de Inteligencia',
        fr: 'Liaison d\'Intelligence',
        de: 'Intelligence Uplink',
        ar: 'وصلة الاستخبارات',
    },
    logFinding: {
        en: 'Log Finding',
        es: 'Registrar Hallazgo',
        fr: 'Journal des Découvertes',
        de: 'Ergebnisse protokollieren',
        ar: 'تسجيل اكتشاف',
    },
    uplinkDesc: {
        en: 'Personnel are requested to upload analytical findings. Once submitted, board review will initiate before publication to the global network.',
        es: 'Se solicita al personal que cargue hallazgos analíticos. Una vez enviado, se iniciará la revisión de la junta antes de la publicación en la red global.',
        fr: 'Le personnel est prié de télécharger les résultats d\'analyse. Une fois soumis, l\'examen du conseil d\'administration commencera avant la publication sur le réseau mondial.',
        de: 'Das Personal wird gebeten, Analyseergebnisse hochzuladen. Nach der Übermittlung wird eine Überprüfung durch das Gremium eingeleitet, bevor die Veröffentlichung im globalen Netzwerk erfolgt.',
        ar: 'يُطلب من الموظفين تحميل النتائج التحليلية. بمجرد التقديم، ستبدأ مراجعة المجلس قبل النشر في الشبكة العالمية.',
    },
    transmissionReceived: {
        en: 'Transmission Received',
        es: 'Transmisión Recibida',
        fr: 'Transmission Reçue',
        de: 'Übertragung empfangen',
        ar: 'تم استلام الإرسال',
    },
    transmissionEnqueued: {
        en: 'Your research data is securely enqueued for mission control review. Confirmation will follow via secure channel.',
        es: 'Sus datos de investigación están en cola de forma segura para la revisión del control de misión. La confirmación seguirá a través de un canal seguro.',
        fr: 'Vos données de recherche sont mises en file d\'attente en toute sécurité pour examen par le contrôle de mission. Une confirmation suivra via un canal sécurisé.',
        de: 'Ihre Forschungsdaten werden sicher in die Warteschlange für die Überprüfung durch das Kontrollzentrum gestellt. Die Bestätigung erfolgt über einen sicheren Kanal.',
        ar: 'بيانات بحثك مدرجة في قائمة الانتظار بأمان لمراجعة التحكم في المهمة. سيتبع التأكيد عبر قناة آمنة.',
    },
    logAdditionalMission: {
        en: 'Log Additional Mission',
        es: 'Registrar Misión Adicional',
        fr: 'Enregistrer une Mission Supplémentaire',
        de: 'Zusätzliche Mission protokollieren',
        ar: 'تسجيل مهمة إضافية',
    },
    missionDesignation: {
        en: 'Mission Designation (Title)',
        es: 'Designación de Misión (Título)',
        fr: 'Désignation de la Mission (Titre)',
        de: 'Missionsbezeichnung (Titel)',
        ar: 'تسمية المهمة (العنوان)',
    },
    titlePlaceholder: {
        en: 'Enter report title...',
        es: 'Ingrese el título del informe...',
        fr: 'Entrez le titre du rapport...',
        de: 'Berichtstitel eingeben...',
        ar: 'أدخل عنوان التقرير...',
    },
    personnelIdentifier: {
        en: 'Personnel Identifier',
        es: 'Identificador de Personal',
        fr: 'Identifiant du Personnel',
        de: 'Personal-ID',
        ar: 'معرف الأفراد',
    },
    fullName: {
        en: 'Full Name',
        es: 'Nombre Completo',
        fr: 'Nom Complet',
        de: 'Vollständiger Name',
        ar: 'الاسم الكامل',
    },
    secureCommsChannel: {
        en: 'Secure Comms Channel (Email)',
        es: 'Canal de Comunicaciones Seguro (Email)',
        fr: 'Canal de Comm. Sécurisé (Email)',
        de: 'Sicherer Kommunikationskanal (Email)',
        ar: 'قناة اتصال آمنة (البريد الإلكتروني)',
    },
    secureAccessKey: {
        en: 'Secure Access Key',
        es: 'Clave de Acceso Segura',
        fr: 'Clé d\'Accès Sécurisée',
        de: 'Sicherer Zugangsschlüssel',
        ar: 'مفتاح الوصول الآمن',
    },
    accessKeyDesc: {
        en: 'Required for future data retraction or modification requests.',
        es: 'Requerido para futuras solicitudes de retiro o modificación de datos.',
        fr: 'Requis pour les futures demandes de retrait ou de modification de données.',
        de: 'Erforderlich für zukünftige Datenrücknahme- oder Änderungsanträge.',
        ar: 'مطلوب لطلبات سحب البيانات أو تعديلها في المستقبل.',
    },
    setSecretKey: {
        en: 'Set secret key...',
        es: 'Establecer clave secreta...',
        fr: 'Définir la clé secrète...',
        de: 'Geheimschlüssel festlegen...',
        ar: 'تعيين المفتاح السري...',
    },
    encryptionProtocols: {
        en: 'Encryption Protocols',
        es: 'Protocolos de Cifrado',
        fr: 'Protocoles de Chiffrement',
        de: 'Verschlüsselungsprotokolle',
        ar: 'بروتوكولات التشفير',
    },
    intelligenceClass: {
        en: 'Intelligence Class (Vectors)',
        es: 'Clase de Inteligencia (Vectores)',
        fr: 'Classe d\'Intelligence (Vecteurs)',
        de: 'Intelligenzklasse (Vektoren)',
        ar: 'فئة الاستخبارات (المتجهات)',
    },
    customClassification: {
        en: 'Custom Classification',
        es: 'Clasificación Personalizada',
        fr: 'Classification Personnalisée',
        de: 'Benutzerdefinierte Klassifizierung',
        ar: 'تصنيف مخصص',
    },
    customPlaceholder: {
        en: 'Enter custom vector classification...',
        es: 'Ingrese la clasificación de vector personalizada...',
        fr: 'Entrez la classification de vecteur personnalisée...',
        de: 'Benutzerdefinierte Vektorklassifizierung eingeben...',
        ar: 'أدخل تصنيف المتجه المخصص...',
    },
    sensorOrigin: {
        en: 'Sensor Origin',
        es: 'Origen del Sensor',
        fr: 'Origine du Capteur',
        de: 'Sensor-Ursprung',
        ar: 'أصل المستشعر',
    },
    sensorPlaceholder: {
        en: 'e.g. Sentinel-2, Landsat 8',
        es: 'ej. Sentinel-2, Landsat 8',
        fr: 'p. ex. Sentinel-2, Landsat 8',
        de: 'z. B. Sentinel-2, Landsat 8',
        ar: 'على سبيل المثال Sentinel-2، Landsat 8',
    },
    geographicTarget: {
        en: 'Geographic Target',
        es: 'Objetivo Geográfico',
        fr: 'Cible Géographique',
        de: 'Geographisches Ziel',
        ar: 'الهدف الجغرافي',
    },
    locationPlaceholder: {
        en: 'Region or Coordinates',
        es: 'Región o Coordenadas',
        fr: 'Région ou Coordonnées',
        de: 'Region oder Koordinaten',
        ar: 'المنطقة أو الإحداثيات',
    },
    missionLogs: {
        en: 'Mission Logs & Analysis',
        es: 'Registros y Análisis de Misión',
        fr: 'Journaux de Mission et Analyse',
        de: 'Missionsprotokolle & Analyse',
        ar: 'سجلات المهمة والتحليل',
    },
    analysisPlaceholder: {
        en: 'Enter complete technical analysis and report logs...',
        es: 'Ingrese el análisis técnico completo y los registros de informes...',
        fr: 'Entrez l\'analyse technique complète et les journaux de rapports...',
        de: 'Vollständige technische Analyse und Berichtsprotokolle eingeben...',
        ar: 'أدخل التحليل الفني الكامل وسجلات التقارير...',
    },
    satelliteImagery: {
        en: 'Satellite Imagery',
        es: 'Imágenes Satelitales',
        fr: 'Imagerie Satellitaire',
        de: 'Satellitenbilder',
        ar: 'صور الأقمار الصناعية',
    },
    uploadImagery: {
        en: 'Upload Sensory Imagery',
        es: 'Cargar Imágenes Sensoriales',
        fr: 'Télécharger l\'Imagerie Sensorielle',
        de: 'Sensorbilder hochladen',
        ar: 'تحميل الصور الحسية',
    },
    addImagery: {
        en: 'Log Additional Image Data',
        es: 'Registrar Datos de Imagen Adicionales',
        fr: 'Enregistrer des Données d\'Images Supplémentaires',
        de: 'Zusätzliche Bilddaten protokollieren',
        ar: 'تسجيل بيانات صور إضافية',
    },
    supplementalDatasets: {
        en: 'Supplemental Datasets',
        es: 'Conjuntos de Datos Suplementarios',
        fr: 'Jeux de Données Supplémentaires',
        de: 'Zusätzliche Datensätze',
        ar: 'مجموعات البيانات التكميلية',
    },
    uploadDatasets: {
        en: 'Upload Primary Datasets',
        es: 'Cargar Conjuntos de Datos Primarios',
        fr: 'Télécharger des Jeux de Données Primaires',
        de: 'Primäre Datensätze hochladen',
        ar: 'تحميل مجموعات البيانات الأولية',
    },
    addDatasets: {
        en: 'Log Additional Datasets',
        es: 'Registrar Conjuntos de Datos Adicionales',
        fr: 'Enregistrer des Jeux de Données Supplémentaires',
        de: 'Zusätzliche Datensätze protokollieren',
        ar: 'تسجيل مجموعات بيانات إضافية',
    },
    initiateUplink: {
        en: 'Initiate Uplink',
        es: 'Iniciar Enlace',
        fr: 'Initier la Liaison',
        de: 'Uplink einleiten',
        ar: 'بدء الوصلة',
    },
    executingTransmission: {
        en: 'Executing Transmission...',
        es: 'Ejecutando Transmisión...',
        fr: 'Exécution de la Transmission...',
        de: 'Übertragung wird ausgeführt...',
        ar: 'جاري تنفيذ الإرسال...',
    },
    uplinkingTelemetry: {
        en: 'Uplinking Telemetry...',
        es: 'Enlazando Telemetría...',
        fr: 'Liaison de la Télémétrie...',
        de: 'Telemetrie-Uplink...',
        ar: 'جاري رفع القياس عن بعد...',
    },
    refineMission: {
        en: 'Refine Mission Data',
        es: 'Refinar Datos de Misión',
        fr: 'Affiner les Données de Mission',
        de: 'Missionsdaten verfeinern',
        ar: 'تحسين بيانات المهمة',
        hi: 'मिशन डेटा को परिष्कृत करें',
        zh: '精化任务数据',
    },
    abort: {
        en: 'Abort Mission',
        es: 'Abortar Misión',
        fr: 'Avorter la Mission',
        de: 'Mission abbrechen',
        ar: 'إلغاء المهمة',
        hi: 'मिशन रद्द करें',
        zh: '中止任务',
    },
    commitChanges: {
        en: 'Commit Changes',
        es: 'Confirmar Cambios',
        fr: 'Valider les Changements',
        de: 'Änderungen übernehmen',
        ar: 'اعتماد التغييرات',
        hi: 'परिवर्तन लागू करें',
        zh: '提交更改',
    },
    committing: {
        en: 'Committing...',
        es: 'Confirmando...',
        fr: 'Validation...',
        de: 'Übernahme...',
        ar: 'جاري الاعتماد...',
    },
    searchLanguage: {
        en: 'Search language...',
        es: 'Buscar idioma...',
        fr: 'Rechercher une langue...',
        de: 'Sprache suchen...',
        ar: 'البحث عن اللغة...',
    },
    noLanguages: {
        en: 'No languages found',
        es: 'No se encontraron idiomas',
        fr: 'Aucune langue trouvée',
        de: 'Keine Sprachen gefunden',
        ar: 'لم يتم العثور على لغات',
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
        if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = ['ar', 'he', 'fa'].includes(language) ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: keyof typeof translations) => {
        const transObj = translations[key] as any;
        return transObj[language] || transObj['en'] || key;
    };

    const isRTL = ['ar', 'he', 'fa'].includes(language);

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
