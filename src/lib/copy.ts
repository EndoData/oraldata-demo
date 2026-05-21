export const copy = {
  nav: {
    links: [
      { label: "Logiciel", href: "#features" },
      { label: "Méthode", href: "#process" },
      { label: "Équipe", href: "#team" },
      { label: "Avis", href: "#testimonials" },
    ],
    primary: "Réserver une démo",
  },

  hero: {
    eyebrow: "Logiciel clinique dentaire",
    headline: "Retrouvez le temps pour vos patients.\nGagnez en excellence clinique.",
    sub:
      "OralData centralise vos dossiers, vos radios et vos protocoles. Chaque minute gagnée retourne à vos patients.",
    primaryCta: "Réserver une démo",
    secondaryCta: "Voir le logiciel",
    specialties: ["Endodontie", "Implantologie", "Omnipratique", "Pédodontie"],
    badges: ["Sans engagement", "Installation en 5 min", "Conforme RGPD et HDS"],
    calendar: {
      title: "Planifier une démo",
      year: 2026,
      month: 4, // 0-indexed: 4 = Mai
      monthLabel: "Mai 2026",
      monthShort: "mai",
      days: ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"],
      selectedDay: 14,
      slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00"],
      selectedSlot: "10:00",
      confirm: "Confirmer le rendez-vous",
    },
  },

  stats: [
    { value: 200, suffix: "+", label: "Cabinets équipés" },
    { value: 1500000, suffix: "+", label: "Documents générés" },
    { value: 20000, suffix: "+", label: "Dentistes correspondants" },
    { value: 200000, suffix: "+", label: "Patients suivis" },
    { value: 16000, suffix: "+", label: "Produits catalogués" },
  ],

  features: {
    eyebrow: "Pourquoi OralData",
    title: "Tout ce qui ralentit votre cabinet.\nRemis à plat.",
    subtitle:
      "Vous ne touchez qu'à OralData. Vos assistant·e·s et secrétaires s'occupent du logiciel de la prise de rendez-vous et de la facturation.",
    items: [
      {
        icon: "FileText",
        title: "Rédaction automatique",
        body: "Vos comptes-rendus rédigés pendant que vous soignez.",
      },
      {
        icon: "Cloud",
        title: "Stockage illimité",
        body: "Radios, photos, DICOM. Tout, pour toujours.",
      },
      {
        icon: "Mic",
        title: "Dictée vocale structurée",
        body: "Parlez. OralData structure et classe.",
      },
      {
        icon: "Users",
        title: "Dossier patient partagé",
        body: "Un seul dossier, accessible à vos correspondants.",
      },
      {
        icon: "Package",
        title: "Catalogue produit",
        body: "Chaque instrument tracé, sourcé, référencé.",
      },
      {
        icon: "BarChart3",
        title: "Statistiques cliniques",
        body: "Votre activité, lue en un coup d'œil.",
      },
      {
        icon: "Calendar",
        title: "Agenda",
        body:
          "OralData lit l'agenda de votre outil de prise de rendez-vous pour centraliser vos consultations et planifier votre journée clinique sans changer de logiciel.",
      },
      {
        icon: "Workflow",
        title: "Intégrations avec logiciels métiers",
        body:
          "OralData extrait les données utiles de vos logiciels métiers pour les centraliser dans le dossier patient — sans double saisie, sans jonglage entre outils.",
      },
    ],
  },

  specialties: {
    eyebrow: "Conçu pour vos spécialités",
    title: "Un logiciel.\nQuatre métiers.",
    sub: "OralData s'adapte aux gestes, aux protocoles et aux patients de chaque discipline.",
    tabs: [
      {
        id: "endo",
        label: "Endodontie",
        title: "Révéler le canal.",
        body:
          "Protocoles préconfigurés, images centralisées, comptes-rendus dictés. Chaque couche de votre acte clinique — anticipée, tracée, partagée.",
        caption: "Du diagnostic à l'obturation",
        stages: [
          { label: "Émail", hint: "La surface visible" },
          { label: "Dentine", hint: "Sous l'émail" },
          { label: "Pulpe", hint: "Le tissu vivant" },
          { label: "Canal obturé", hint: "Traité, scellé, archivé" },
        ],
      },
      {
        id: "implanto",
        label: "Implantologie",
        title: "De la pose à la mise en charge.",
        body:
          "Planifiez sur le scanner, suivez l'ostéointégration, archivez chaque étape. Votre chirurgie, documentée sans effort.",
        caption: "Planification · Pose · Suivi",
        stages: [
          { label: "Gencive", hint: "Point de départ clinique" },
          { label: "Os alvéolaire", hint: "Le support osseux" },
          { label: "Implant titane", hint: "Ancré, intégré" },
          { label: "Couronne", hint: "La mise en charge" },
        ],
      },
      {
        id: "omni",
        label: "Omnipratique",
        title: "Votre pratique généraliste, fluide.",
        body:
          "Consultations, soins courants, suivi de routine — un seul dossier qui suit le patient de la première visite à l'année suivante. Fini les quinze onglets.",
        caption: "Le quotidien du praticien généraliste",
        stages: [
          { label: "Consultation", hint: "Le premier rendez-vous" },
          { label: "Diagnostic", hint: "Constat clinique posé" },
          { label: "Soin", hint: "Geste et traçabilité" },
          { label: "Suivi", hint: "Le patient revient" },
        ],
      },
      {
        id: "pedo",
        label: "Pédodontie",
        title: "Suivre la croissance.",
        body:
          "De la première dent de lait au sourire adulte, OralData accompagne chaque enfant. Alertes d'éruption, courbes, photos — dans la durée.",
        caption: "De la première visite au sourire adulte",
        stages: [
          { label: "Dent de lait", hint: "Première consultation" },
          { label: "Transition", hint: "Chute et éruption" },
          { label: "Émergence", hint: "La dent permanente" },
          { label: "Sourire adulte", hint: "Le suivi s'achève" },
        ],
      },
    ],
  },

  process: {
    eyebrow: "Comment ça marche",
    title: "Un flux de travail adaptable\npour tout type de praticien.",
    sub:
      "OralData s'intègre à votre logiciel métier — puis adopte le compte rendu qui vous ressemble.",
    steps: [
      {
        number: "01",
        title: "Intégration avec votre logiciel métier",
        body:
          "OralData se branche à votre outil de devis et de facturation. Vous gardez le clinique, votre équipe garde l'administratif.",
      },
      {
        number: "02",
        title: "Choix du compte rendu",
        body: "Très simple ou très détaillé — vous décidez.",
        variants: [
          {
            id: "simple",
            label: "Très simple",
            subtitle: "Live Report",
            tagline: "Audio pendant la consultation. Compte rendu envoyé au patient.",
            steps: [
              {
                number: "01",
                title: "Activez le micro et menez votre consultation",
                body: "Parlez normalement à votre patient. OralData écoute en arrière-plan.",
              },
              {
                number: "02",
                title: "OralData rédige le compte rendu en temps réel",
                body: "Le rapport prend forme pendant l'acte clinique, sans intervention de votre part.",
              },
              {
                number: "03",
                title: "Envoyé au patient et archivé dans son dossier",
                body: "Le compte rendu part au patient et reste consultable dans son historique.",
              },
            ],
          },
          {
            id: "detailed",
            label: "Très détaillé",
            subtitle: "Checklist",
            tagline: "Une trace clinique structurée, point par point.",
            steps: [
              {
                number: "01",
                title: "Suivez la checklist clinique structurée",
                body: "Examen dentaire, tests, observations — chaque point est anticipé par OralData.",
              },
              {
                number: "02",
                title: "OralData remplit chaque ligne à votre dictée",
                body: "Vous parlez, le logiciel coche, classe et structure votre acte.",
              },
              {
                number: "03",
                title: "Partagé instantanément avec vos correspondants",
                body: "Le dossier complet devient consultable par vos pairs en un clic.",
              },
            ],
          },
        ],
      },
    ],
  },

  team: {
    eyebrow: "Conçu par des spécialistes",
    title: "Une équipe de praticiens.\nPour les praticiens.",
    sub:
      "Des cliniciennes et cliniciens qui connaissent votre métier de l'intérieur.",
    members: [
      { name: "Dr. Emmanuelle Ettedgui", role: "Implantologiste", initials: "EE", tint: "from-brand-100 to-brand-200", image: "/team/emmanuelle.jpg" },
      { name: "Dr. Cécile Xiang", role: "Pédodontiste", initials: "CX", tint: "from-amber-50 to-amber-100", image: "/team/cecile.jpg" },
      { name: "Dr. Sandrine Danan", role: "Endodontiste", initials: "SD", tint: "from-rose-50 to-rose-100", image: "/team/sandrine.jpg" },
      { name: "Dr. Muriel Tawfik", role: "Pédodontiste", initials: "MT", tint: "from-brand-50 to-brand-100", image: "/team/muriel.jpg" },
      { name: "Dr. Cauris Couvrechel", role: "Endodontiste", initials: "CC", tint: "from-stone-100 to-stone-200", image: "/team/cauris.jpg" },
    ],
  },

  testimonials: {
    eyebrow: "Ce que disent nos utilisateurs",
    title: "Des cabinets qui ont\nretrouvé leur rythme.",
    handle: "@oraldata_software",
    items: [
      {
        quote:
          "Un retour en arrière est impensable, les correspondants et les patients adorent. Le gain de temps et le sérieux des comptes rendus sont formidables.",
        author: "Dr Laurent A.",
      },
      {
        quote:
          "Travailler avec OralData, c'est entrer dans une nouvelle ère.",
        author: "Dr Céline H.",
      },
      {
        quote:
          "Le logiciel est intuitif et didactique. La communication avec mes correspondants est grandement améliorée.",
        author: "Dr Cyril P.",
      },
      {
        quote:
          "OralData est à ce jour un de mes meilleurs achats professionnels.",
        author: "Dr Gregory C.",
      },
      {
        quote:
          "OralData est parfaitement adapté à mon activité, le logiciel est abouti et très performant.",
        author: "Dr Karim J.",
      },
      {
        quote:
          "Le logiciel est très facile à prendre en main, vraiment intuitif, et permet de gagner du temps au quotidien dans la pratique.",
        author: "Dr Dorian C.",
      },
      {
        quote: "Un logiciel dédié performant, je recommande !",
        author: "Dr Claire B.",
      },
      {
        quote: "Que du bonheur !",
        author: "Dr Céline H.",
      },
    ],
  },

  finalCta: {
    eyebrow: "Prêt à transformer votre cabinet ?",
    title: "Retrouvez votre temps.\nDès la semaine prochaine.",
    sub:
      "Démonstration gratuite de 30 minutes. Sans engagement. Installation en 5 minutes.",
    primary: "Réserver une démo",
    secondary: "Parler à un conseiller",
    small:
      "Démonstration animée par Pierre et Chantal, assistants dentaires, qui vous aideront à mettre en place le logiciel selon l'organisation de votre cabinet.",
  },

  footer: {
    columns: [
      {
        title: "Produit",
        links: ["Fonctionnalités", "Tarifs", "Modules", "Installation"],
      },
      {
        title: "Ressources",
        links: ["Blog", "Webinaires", "FAQ", "Support"],
      },
      {
        title: "Société",
        links: ["À propos", "Équipe", "Mentions légales", "Contact"],
      },
    ],
    copyright: "OralData © 2026. Tous droits réservés.",
    tagline: "Moins de temps perdu. Plus de patients soignés.",
  },
} as const;
