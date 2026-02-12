export type Lang = 'en' | 'es'

export const copy: Record<Lang, {
  nav: {
    product: string
    howItWorks: string
    pricing: string
    faq: string
    startFree: string
    bookDemo: string
    login: string
  }
  hero: {
    headline: string
    subheadline: string
    startFree: string
    bookDemo: string
    socialProof: string
  }
  problem: {
    title: string
    bullets: string[]
  }
  howItWorks: {
    title: string
    steps: {
      title: string
      description: string
    }[]
  }
  features: {
    title: string
    items: {
      title: string
      description: string
    }[]
  }
  productTour: {
    title: string
    screens: {
      title: string
      description: string
    }[]
  }
  trust: {
    title: string
    items: string[]
  }
  pricing: {
    title: string
    subtitle: string
    note: string
    plans: {
      name: string
      price: string
      bestFor: string
      features: string[]
    }[]
  }
  faq: {
    title: string
    items: {
      question: string
      answer: string
    }[]
  }
  finalCta: {
    headline: string
    subheadline: string
    startFree: string
    bookDemo: string
  }
  footer: {
    privacy: string
    terms: string
    contact: string
    login: string
    launching: string
    copyright: string
  }
}> = {
  en: {
    nav: {
      product: 'Product',
      howItWorks: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
      startFree: 'Start free',
      bookDemo: 'Book a demo',
      login: 'Login',
    },
    hero: {
      headline: 'Fundraising, organized and automated.',
      subheadline: 'Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don\'t have to.',
      startFree: 'Start free',
      bookDemo: 'Book a demo',
      socialProof: 'Built for founders raising Seed / Series A',
    },
    problem: {
      title: 'Stop fundraising in spreadsheets and shared folders.',
      bullets: [
        'Follow-ups get missed',
        'Sensitive docs shared too early',
        'No engagement signals',
        'Fragmented tools waste time',
      ],
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        {
          title: 'Upload documents once',
          description: 'Organize your pitch deck, financials, legal docs, and metrics in one place.',
        },
        {
          title: 'Define stage-based access rules',
          description: 'Set which documents each investor sees at each stage, with optional delays and automated emails.',
        },
        {
          title: 'Move investors through stages',
          description: 'When you move an investor to the next stage, access updates automatically—no manual sharing needed.',
        },
      ],
    },
    features: {
      title: 'Everything you need to run your raise',
      items: [
        {
          title: 'Kanban fundraising CRM',
          description: 'Visual pipeline with drag & drop, tags, and full history timeline.',
        },
        {
          title: 'Follow-up reminders',
          description: 'Visual flags when it\'s been more than 14 days without contact.',
        },
        {
          title: 'Stage-based data room',
          description: 'Per-document permissions that update automatically as investors move through stages.',
        },
        {
          title: 'Automations',
          description: 'Share documents and send emails when investors advance, with optional delays.',
        },
        {
          title: 'Investor portal',
          description: 'Email + 6-digit code access—no passwords. Professional, branded experience.',
        },
        {
          title: 'Engagement signals',
          description: 'Track views and downloads. Get in-app notifications when investors interact with documents.',
        },
        {
          title: 'Teams & roles',
          description: 'Invite your team with roles (Owner/Admin/Editor/Viewer) and customize branding.',
        },
        {
          title: 'Dashboard & export',
          description: 'Pipeline metrics, document analytics, and CSV export for reporting.',
        },
      ],
    },
    productTour: {
      title: 'See it in action',
      screens: [
        {
          title: 'Pipeline board',
          description: 'Visual Kanban with drag & drop, tags, and follow-up reminders.',
        },
        {
          title: 'Rules & automations',
          description: 'Configure stage-based sharing with delays and email notifications.',
        },
        {
          title: 'Investor portal & signals',
          description: 'Investors access via email + code. You see views and downloads in real-time.',
        },
      ],
    },
    trust: {
      title: 'Built for security and reliability',
      items: [
        'Investor access via email + one-time code (no passwords)',
        'Built on Firebase (Auth / Firestore / Storage)',
        'Emails sent via Resend (investia.capital domain)',
      ],
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Simple, transparent pricing',
      note: 'Prices in EUR. Cancel anytime.',
      plans: [
        {
          name: 'Free',
          price: '€0',
          bestFor: 'First-time raise / getting organized',
          features: [
            'Up to 10 investors',
            'Basic pipeline board',
            'Document storage',
            'Investor portal access',
          ],
        },
        {
          name: 'Starter',
          price: '€59',
          bestFor: 'Active Seed raise',
          features: [
            'Unlimited investors',
            'Full pipeline CRM',
            'Stage-based permissions',
            'Basic automations',
            'Team collaboration included',
            'Engagement tracking',
          ],
        },
        {
          name: 'Pro',
          price: '€149',
          bestFor: 'High-velocity pipeline + advanced workflows',
          features: [
            'Everything in Starter',
            'Advanced automations',
            'Custom email templates',
            'Priority support',
            'CSV export',
            'Team branding',
          ],
        },
        {
          name: 'Advisor',
          price: '€399',
          bestFor: 'Fundraising advisors / multiple startups',
          features: [
            'Everything in Pro',
            'Multiple teams',
            'Advanced analytics',
            'Dedicated support',
            'Custom integrations',
          ],
        },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          question: 'Is this a replacement for DocSend?',
          answer: 'InvestiaFlow combines CRM and data room functionality. While DocSend focuses on document sharing, we provide a complete fundraising pipeline with stage-based permissions, automations, and investor tracking—all in one platform.',
        },
        {
          question: 'Can I control which docs investors see?',
          answer: 'Yes. You set per-document permissions based on pipeline stages. When an investor moves to a new stage, they automatically get access to the documents configured for that stage. You can also add delays before sharing.',
        },
        {
          question: 'How does the investor portal work?',
          answer: 'Investors receive an email with a link to their portal. They enter their email and receive a 6-digit verification code—no password needed. Once logged in, they see only the documents you\'ve shared based on their current pipeline stage.',
        },
        {
          question: 'Can I delay sharing documents?',
          answer: 'Yes. When configuring automations, you can set a delay in days before documents are shared or emails are sent. For example, share financials 3 days after an investor enters Due Diligence.',
        },
        {
          question: 'Do I need integrations (Zapier/HubSpot)?',
          answer: 'Not required. InvestiaFlow is a complete solution with built-in CRM, data room, automations, and email. However, CSV export is available for data analysis in external tools if needed.',
        },
        {
          question: 'Can my team collaborate with roles?',
          answer: 'Yes. Invite team members with roles: Viewer (read-only), Editor (manage leads and documents), Admin (team management and branding), or Owner (full control). Team collaboration is included in all paid plans.',
        },
        {
          question: 'Do you track views and downloads?',
          answer: 'Yes. Every view and download is tracked and displayed in the investor\'s profile. You\'ll receive in-app notifications when investors interact with documents, so you know when to follow up.',
        },
        {
          question: 'Which fundraising stages do you support?',
          answer: 'InvestiaFlow includes default stages: Target, First Contact, In Conversation, Pitch Shared, Due Diligence, Term Sheet, Committed, and Passed. You can customize these stages to match your fundraising process.',
        },
      ],
    },
    finalCta: {
      headline: 'Run your raise like a system.',
      subheadline: 'Stop chasing investors manually. Start automating your fundraising process today.',
      startFree: 'Start free',
      bookDemo: 'Book a demo',
    },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      login: 'Login',
      launching: 'Launching UK/EU-first',
      copyright: '© 2026 InvestiaFlow. All rights reserved.',
    },
  },
  es: {
    nav: {
      product: 'Producto',
      howItWorks: 'Cómo funciona',
      pricing: 'Precios',
      faq: 'Preguntas',
      startFree: 'Empezar gratis',
      bookDemo: 'Reservar demo',
      login: 'Iniciar sesión',
    },
    hero: {
      headline: 'Fundraising organizado y automatizado.',
      subheadline: 'Mueve inversores por etapas. InvestiaFlow comparte automáticamente los documentos correctos en el momento adecuado—para que tú no tengas que hacerlo.',
      startFree: 'Empezar gratis',
      bookDemo: 'Reservar demo',
      socialProof: 'Diseñado para fundadores levantando Seed / Serie A',
    },
    problem: {
      title: 'Deja de hacer fundraising en hojas de cálculo y carpetas compartidas.',
      bullets: [
        'Los seguimientos se olvidan',
        'Documentos sensibles compartidos demasiado pronto',
        'Sin señales de engagement',
        'Herramientas fragmentadas desperdician tiempo',
      ],
    },
    howItWorks: {
      title: 'Cómo funciona',
      steps: [
        {
          title: 'Sube documentos una vez',
          description: 'Organiza tu pitch deck, estados financieros, documentos legales y métricas en un solo lugar.',
        },
        {
          title: 'Define reglas de acceso por etapa',
          description: 'Establece qué documentos ve cada inversor en cada etapa, con retrasos opcionales y emails automatizados.',
        },
        {
          title: 'Mueve inversores por etapas',
          description: 'Cuando mueves un inversor a la siguiente etapa, el acceso se actualiza automáticamente—sin compartir manualmente.',
        },
      ],
    },
    features: {
      title: 'Todo lo que necesitas para tu ronda',
      items: [
        {
          title: 'CRM de fundraising tipo Kanban',
          description: 'Pipeline visual con arrastrar y soltar, etiquetas e historial completo.',
        },
        {
          title: 'Recordatorios de seguimiento',
          description: 'Avisos visuales cuando han pasado más de 14 días sin contacto.',
        },
        {
          title: 'Data Room por etapas',
          description: 'Permisos por documento que se actualizan automáticamente cuando los inversores avanzan de etapa.',
        },
        {
          title: 'Automatizaciones',
          description: 'Comparte documentos y envía emails cuando los inversores avanzan, con retrasos opcionales.',
        },
        {
          title: 'Portal de inversores',
          description: 'Acceso por email + código de 6 dígitos—sin contraseñas. Experiencia profesional y personalizada.',
        },
        {
          title: 'Señales de engagement',
          description: 'Rastrea visualizaciones y descargas. Recibe notificaciones cuando los inversores interactúan con documentos.',
        },
        {
          title: 'Equipos y roles',
          description: 'Invita a tu equipo con roles (Owner/Admin/Editor/Viewer) y personaliza la marca.',
        },
        {
          title: 'Dashboard y exportación',
          description: 'Métricas del pipeline, análisis de documentos y exportación CSV para informes.',
        },
      ],
    },
    productTour: {
      title: 'Vélo en acción',
      screens: [
        {
          title: 'Tablero de pipeline',
          description: 'Kanban visual con arrastrar y soltar, etiquetas y recordatorios de seguimiento.',
        },
        {
          title: 'Reglas y automatizaciones',
          description: 'Configura el compartir por etapas con retrasos y notificaciones por email.',
        },
        {
          title: 'Portal de inversores y señales',
          description: 'Los inversores acceden por email + código. Ves visualizaciones y descargas en tiempo real.',
        },
      ],
    },
    trust: {
      title: 'Construido para seguridad y confiabilidad',
      items: [
        'Acceso de inversores por email + código único (sin contraseñas)',
        'Construido sobre Firebase (Auth / Firestore / Storage)',
        'Emails enviados vía Resend (dominio investia.capital)',
      ],
    },
    pricing: {
      title: 'Precios',
      subtitle: 'Precios simples y transparentes',
      note: 'Precios en EUR. Cancela cuando quieras.',
      plans: [
        {
          name: 'Gratis',
          price: '€0',
          bestFor: 'Primera ronda / organizarse',
          features: [
            'Hasta 10 inversores',
            'Tablero básico de pipeline',
            'Almacenamiento de documentos',
            'Acceso al portal de inversores',
          ],
        },
        {
          name: 'Starter',
          price: '€59',
          bestFor: 'Ronda Seed activa',
          features: [
            'Inversores ilimitados',
            'CRM completo de pipeline',
            'Permisos por etapas',
            'Automatizaciones básicas',
            'Colaboración en equipo incluida',
            'Seguimiento de engagement',
          ],
        },
        {
          name: 'Pro',
          price: '€149',
          bestFor: 'Pipeline de alta velocidad + flujos avanzados',
          features: [
            'Todo lo de Starter',
            'Automatizaciones avanzadas',
            'Plantillas de email personalizadas',
            'Soporte prioritario',
            'Exportación CSV',
            'Marca del equipo',
          ],
        },
        {
          name: 'Advisor',
          price: '€399',
          bestFor: 'Asesores de fundraising / múltiples startups',
          features: [
            'Todo lo de Pro',
            'Múltiples equipos',
            'Analíticas avanzadas',
            'Soporte dedicado',
            'Integraciones personalizadas',
          ],
        },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Esto reemplaza a DocSend?',
          answer: 'InvestiaFlow combina CRM y funcionalidad de data room. Mientras DocSend se enfoca en compartir documentos, nosotros proporcionamos un pipeline completo de fundraising con permisos por etapas, automatizaciones y seguimiento de inversores—todo en una plataforma.',
        },
        {
          question: '¿Puedo controlar qué documentos ven los inversores?',
          answer: 'Sí. Estableces permisos por documento según las etapas del pipeline. Cuando un inversor avanza a una nueva etapa, automáticamente obtiene acceso a los documentos configurados para esa etapa. También puedes agregar retrasos antes de compartir.',
        },
        {
          question: '¿Cómo funciona el portal de inversores?',
          answer: 'Los inversores reciben un email con un enlace a su portal. Ingresan su email y reciben un código de verificación de 6 dígitos—no necesitan contraseña. Una vez dentro, solo ven los documentos que has compartido según su etapa actual en el pipeline.',
        },
        {
          question: '¿Puedo retrasar el compartir documentos?',
          answer: 'Sí. Al configurar automatizaciones, puedes establecer un retraso en días antes de compartir documentos o enviar emails. Por ejemplo, compartir estados financieros 3 días después de que un inversor entra en Due Diligence.',
        },
        {
          question: '¿Necesito integraciones (Zapier/HubSpot)?',
          answer: 'No es necesario. InvestiaFlow es una solución completa con CRM integrado, data room, automatizaciones y email. Sin embargo, la exportación CSV está disponible para análisis de datos en herramientas externas si lo necesitas.',
        },
        {
          question: '¿Mi equipo puede colaborar con roles?',
          answer: 'Sí. Invita miembros del equipo con roles: Viewer (solo lectura), Editor (gestionar leads y documentos), Admin (gestión de equipo y marca), u Owner (control total). La colaboración en equipo está incluida en todos los planes de pago.',
        },
        {
          question: '¿Rastrean visualizaciones y descargas?',
          answer: 'Sí. Cada visualización y descarga se rastrea y se muestra en el perfil del inversor. Recibirás notificaciones en la app cuando los inversores interactúan con documentos, para que sepas cuándo hacer seguimiento.',
        },
        {
          question: '¿Qué etapas de fundraising soportan?',
          answer: 'InvestiaFlow incluye etapas por defecto: Target, First Contact, In Conversation, Pitch Shared, Due Diligence, Term Sheet, Committed y Passed. Puedes personalizar estas etapas para que coincidan con tu proceso de fundraising.',
        },
      ],
    },
    finalCta: {
      headline: 'Gestiona tu ronda como un sistema.',
      subheadline: 'Deja de perseguir inversores manualmente. Comienza a automatizar tu proceso de fundraising hoy.',
      startFree: 'Empezar gratis',
      bookDemo: 'Reservar demo',
    },
    footer: {
      privacy: 'Privacidad',
      terms: 'Términos',
      contact: 'Contacto',
      login: 'Iniciar sesión',
      launching: 'Lanzamiento UK/EU primero',
      copyright: '© 2026 InvestiaFlow. Todos los derechos reservados.',
    },
  },
}

export function getLangFromSearchParams(searchParams: { lang?: string | string[] }): Lang {
  const lang = searchParams.lang
  if (lang === 'es' || lang === 'en') {
    return lang
  }
  if (Array.isArray(lang)) {
    return lang[0] === 'es' ? 'es' : 'en'
  }
  return 'en'
}
