import axios from 'axios';

const DEFAULT_MAX_INCOME = 500000;

const INDIA_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    level: 'National',
    summary:
      'Income support for eligible farmer families across India through Direct Benefit Transfer installments.',
    eligibility: [
      'Resident farmer family in India with valid identity and bank details.',
      'Landholding up to 2 hectares (approximately 5 acres).',
      'Landholding/cultivation records as per local verification process.',
    ],
    limits: { maxLand: 2, maxIncome: null },
    applySteps: [
      'Register via nearest CSC/Agriculture office or PM-KISAN channels.',
      'Submit Aadhaar, bank account, and land/cultivation details.',
      'Track beneficiary status on PM-KISAN portal.',
    ],
    sources: ['https://pmkisan.gov.in/'],
    keywords: ['pm kisan', 'kisan income support', 'income support', 'dbt'],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 2;
      return profile.isIndianResident && profile.hasAadhaar && profile.hasBankAccount && (profile.hasLandProof || profile.isRegisteredCultivator) && hasMaxLand;
    },
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    level: 'National',
    summary:
      'Crop insurance support for notified crops and seasons with subsidized premium and claim protection.',
    eligibility: [
      'Farmer growing notified crops in notified areas.',
      'Landholding up to 5 hectares (approximately 12 acres).',
      'Must enroll before crop season deadlines.',
      'Landowner and eligible cultivator categories can be covered as per local implementation.',
    ],
    limits: { maxLand: 5, maxIncome: null },
    applySteps: [
      'Enroll through insurance channel/bank/CSC before seasonal deadline.',
      'Provide Aadhaar, bank account, crop and land/cultivation details.',
      'Track policy and claim status using PMFBY channels.',
    ],
    sources: ['https://pmfby.gov.in/'],
    keywords: ['pmfby', 'crop insurance', 'fasal bima', 'claim'],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 5;
      return (
        profile.isIndianResident &&
        profile.hasCropCultivation &&
        profile.hasCropInsuranceNeed &&
        profile.hasAadhaar &&
        profile.hasBankAccount &&
        profile.hasEnrolledBeforeSeason &&
        hasMaxLand
      );
    },
  },
  {
    id: 'pmksy-micro-irrigation',
    name: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
    level: 'National',
    summary:
      'Supports adoption of drip/sprinkler irrigation for better water-use efficiency in agriculture.',
    eligibility: [
      'Farmer with cultivable land and irrigation requirement.',
      'Landholding up to 5 hectares (approximately 12 acres). Priority to small/marginal farmers (< 2 hectares).',
      'Priority is often given to small and marginal farmers.',
    ],
    limits: { maxLand: 5, maxIncome: null },
    applySteps: [
      'Apply through Agriculture/Horticulture department in your state.',
      'Provide Aadhaar, bank, land and crop details.',
      'Complete field verification and subsidy approval process.',
    ],
    sources: ['https://pmksy.gov.in/'],
    keywords: ['pmksy', 'drip', 'sprinkler', 'micro irrigation'],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 5;
      return (
        profile.isIndianResident &&
        profile.needsIrrigation &&
        profile.landHectares > 0 &&
        profile.hasAadhaar &&
        profile.hasBankAccount &&
        profile.hasLandProof &&
        hasMaxLand
      );
    },
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    level: 'National',
    summary:
      'Provides short-term formal credit support for crop cultivation and related farm needs.',
    eligibility: [
      'Eligible farmer/cultivator with crop activity.',
      'Landholding up to 5 hectares (approximately 12 acres) for subsidy eligibility.',
      'Identity, bank, and cultivation/land records required by lending process.',
    ],
    limits: { maxLand: 5, maxIncome: null },
    applySteps: [
      'Apply at participating banks/financial institutions.',
      'Submit Aadhaar, bank and cultivation details.',
      'Complete verification and sanction process.',
    ],
    sources: ['https://www.nabard.org/', 'https://agricoop.nic.in/'],
    keywords: ['kcc', 'credit', 'crop loan', 'kisan credit card'],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 5;
      return (
        profile.isIndianResident &&
        profile.hasCropCultivation &&
        profile.hasAadhaar &&
        profile.hasBankAccount &&
        (profile.hasLandProof || profile.isRegisteredCultivator) &&
        hasMaxLand
      );
    },
  },
  {
    name: 'YSR Rythu Bharosa',
    id: 'ysr-rythu-bharosa',
    level: 'Andhra Pradesh',
    aliases: ['ysr rythu bharosa', 'raithu bharosa', 'rythu bharosa', 'ysrcp raithu barosa'],
    summary:
      'YSR Rythu Bharosa provides annual financial assistance to eligible farmer families in Andhra Pradesh, integrated with PM-KISAN support.',
    eligibility: [
      'Farmer families in Andhra Pradesh with eligible land records/e-crop registration.',
      'Landholding up to 4 hectares (approximately 10 acres).',
      'Annual income limit: Gé¦500,000.',
      'Tenant farmers may be covered based on current AP government guidelines and verification.',
    ],
    limits: { maxLand: 4, maxIncome: 500000 },
    applySteps: [
      'Visit your nearest RBK (Rythu Bharosa Kendra) or Village/Ward Secretariat.',
      'Submit Aadhaar, land record/passbook details, bank account, and mobile number for DBT.',
      'Ensure your e-Crop booking and beneficiary details are updated.',
      'Track status through local Secretariat/RBK officials or official AP beneficiary portals.',
    ],
    eligibilityCheck: (profile) => {
      const hasCultivableLand = Number(profile?.landHectares || 0) > 0;
      const isTenant = profile?.farmerType === 'tenant';
      const apResident = profile?.state === 'Andhra Pradesh';
      const hasMaxLand = profile.landHectares <= 4;
      const hasMaxIncome = profile.annualIncome == null || profile.annualIncome <= 500000;
      return apResident && profile.hasAadhaar && profile.hasBankAccount && (hasCultivableLand || isTenant) && hasMaxLand && hasMaxIncome;
    },
    sources: [
      'https://ysrrythubharosa.ap.gov.in/',
      'https://apagrisnet.gov.in/',
    ],
    keywords: ['apply', 'application', 'eligible', 'eligibility', 'amount', 'status', 'documents', 'dbt'],
  },
  {
    name: 'YSR Free Crop Insurance',
    id: 'ysr-free-crop-insurance',
    level: 'Andhra Pradesh',
    aliases: ['ysr crop insurance', 'free crop insurance', 'ap crop insurance'],
    summary:
      'Andhra Pradesh provides crop insurance support to eligible farmers with premium support under state implementation.',
    eligibility: [
      'Farmers in Andhra Pradesh with valid crop details and enrollment as per notified crops/seasons.',
      'Landholding up to 4 hectares (approximately 10 acres).',
      'Annual income limit: Gé¦500,000.',
      'Accurate e-Crop data and land/cultivation details are typically required.',
    ],
    limits: { maxLand: 4, maxIncome: 500000 },
    applySteps: [
      'Register crop details through village-level agriculture functionaries/RBK process.',
      'Confirm bank account and Aadhaar are linked correctly.',
      'For claim and grievance, approach RBK/Agriculture Office with season and crop details.',
    ],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 4;
      const hasMaxIncome = profile.annualIncome == null || profile.annualIncome <= 500000;
      return (
        profile?.state === 'Andhra Pradesh' &&
        profile?.hasCropInsuranceNeed === true &&
        profile?.hasCropCultivation === true &&
        profile?.hasAadhaar === true &&
        profile?.hasBankAccount === true &&
        hasMaxLand &&
        hasMaxIncome
      );
    },
    sources: ['https://apagrisnet.gov.in/'],
    keywords: ['insurance', 'claim', 'premium', 'crop loss'],
  },
  {
    name: 'AP Micro Irrigation Project (APMIP)',
    id: 'apmip',
    level: 'Andhra Pradesh',
    aliases: ['apmip', 'micro irrigation', 'drip irrigation subsidy', 'sprinkler subsidy andhra pradesh'],
    summary:
      'APMIP supports farmers with subsidies for drip and sprinkler irrigation systems in Andhra Pradesh.',
    eligibility: [
      'Eligible AP farmers based on landholding category and notified subsidy norms.',
      'Landholding up to 4 hectares (approximately 10 acres). Priority to small/marginal farmers (< 2 hectares).',
      'Technical feasibility and field verification may apply.',
    ],
    limits: { maxLand: 4, maxIncome: null },
    applySteps: [
      'Apply via Agriculture/Horticulture department channels or local RBK facilitation.',
      'Submit Aadhaar, land records, crop details, and irrigation requirement.',
      'Site verification and subsidy approval are processed as per department norms.',
    ],
    eligibilityCheck: (profile) => {
      const hasMaxLand = profile.landHectares <= 4;
      return (
        profile?.state === 'Andhra Pradesh' &&
        Number(profile?.landHectares || 0) > 0 &&
        profile?.needsIrrigation === true &&
        profile?.hasAadhaar === true &&
        profile?.hasBankAccount === true &&
        hasMaxLand
      );
    },
    sources: ['https://apagrisnet.gov.in/'],
    keywords: ['drip', 'sprinkler', 'irrigation', 'subsidy'],
  },
];

function parseIncome(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isWithinSchemeLimits(scheme, profile) {
  const maxLand = scheme?.limits?.maxLand;
  const maxIncome = scheme?.limits?.maxIncome == null ? DEFAULT_MAX_INCOME : scheme.limits.maxIncome;

  const withinLand = maxLand == null || profile.landHectares <= maxLand;
  const withinIncome = maxIncome == null || profile.annualIncome == null || profile.annualIncome <= maxIncome;

  return withinLand && withinIncome;
}

function buildSchemeCard(scheme, reason) {
  return {
    name: scheme.name,
    level: scheme.level,
    summary: scheme.summary,
    reason,
    sources: scheme.sources,
    applySteps: scheme.applySteps,
  };
}

function normalize(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getRankedSchemes(question) {
  const q = normalize(question);
  const scored = [];

  for (const scheme of INDIA_SCHEMES) {
    const searchTokens = [scheme.name, ...(scheme.aliases || []), ...(scheme.keywords || [])].map(normalize);
    let score = 0;

    for (const token of searchTokens) {
      if (token && q.includes(token)) {
        score += token.length > 12 ? 3 : 2;
      }

      const tokenWords = token.split(' ').filter(Boolean);
      if (tokenWords.length > 1 && tokenWords.every((w) => q.includes(w))) {
        score += 2;
      }
    }

    scored.push({ scheme, score });
  }

  return scored.sort((a, b) => b.score - a.score);
}

function isBroadSchemeQuery(question) {
  const q = normalize(question);
  const broadTerms = ['latest', 'new', 'recent', 'list', 'all', 'schemes', 'farmer schemes', 'agriculture schemes'];
  return broadTerms.some((term) => q.includes(term));
}

function buildFallbackAnswer(question, rankedSchemes) {
  const topSchemes = rankedSchemes.filter((item) => item.score > 0).slice(0, 3).map((item) => item.scheme);

  if (isBroadSchemeQuery(question)) {
    return [
      'Farmer schemes currently tracked (India + state level):',
      '',
      ...INDIA_SCHEMES.map((scheme, idx) => `${idx + 1}. ${scheme.name} [${scheme.level}]: ${scheme.summary}`),
      '',
      'Ask a specific follow-up like:',
      '- PM-KISAN eligibility',
      '- PMFBY crop insurance enrollment',
      '- YSR Rythu Bharosa eligibility in Andhra Pradesh',
    ].join('\n');
  }

  if (topSchemes.length === 0) {
    return [
      'I could not map the question to a tracked scheme with high confidence.',
      '',
      `Question: "${question}"`,
      'Currently tracked schemes:',
      ...INDIA_SCHEMES.map((scheme, idx) => `${idx + 1}. ${scheme.name} [${scheme.level}]`),
      '',
      'Try asking with scheme name, for example: "How to apply PM-KISAN?"',
    ].join('\n');
  }

  const scheme = topSchemes[0];
  return [
    `${scheme.name} (${scheme.level})`,
    '',
    `Summary: ${scheme.summary}`,
    '',
    'Eligibility:',
    ...scheme.eligibility.map((item) => `- ${item}`),
    '',
    'How to apply:',
    ...scheme.applySteps.map((item, idx) => `${idx + 1}. ${item}`),
  ].join('\n');
}

async function generateWithGemini(question, rankedSchemes) {
  const apiKey = process.env.GEMINI_API_KEY;
  const contextSchemes = rankedSchemes.filter((item) => item.score > 0).slice(0, 3).map((item) => item.scheme);
  if (!apiKey || contextSchemes.length === 0) {
    return null;
  }

  const schemesContext = contextSchemes
    .map((scheme) => {
      return [
        `Scheme: ${scheme.name}`,
        `Summary: ${scheme.summary}`,
        `Eligibility: ${scheme.eligibility.join(' | ')}`,
        `Apply steps: ${scheme.applySteps.join(' | ')}`,
      ].join('\n');
    })
    .join('\n\n');

  const prompt = [
    'You are an India agriculture scheme assistant.',
    'Answer only using the provided scheme facts. Do not invent policies, amounts, links, or deadlines.',
    'If the user asks for latest/new schemes, list the available tracked schemes clearly with level (National/State).',
    'Keep response concise, practical, and action-oriented.',
    '',
    `User question: ${question}`,
    '',
    'Verified facts:',
    schemesContext,
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 450,
        },
      },
      { timeout: 15000 }
    );

    const text = response?.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('')?.trim();
    return text || null;
  } catch {
    return null;
  }
}

async function fetchLatestAPSources(question) {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) {
    return [];
  }

  const query = `${question} India agriculture scheme site:gov.in`;

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx,
        q: query,
        num: Number(process.env.GOOGLE_CSE_NUM || 5),
      },
      timeout: 12000,
    });

    const items = response?.data?.items || [];
    return items.slice(0, 3).map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch {
    return [];
  }
}

export async function getAndhraPradeshSchemeAnswer(question) {
  const rankedSchemes = getRankedSchemes(question);
  const topMatch = rankedSchemes[0]?.score > 0 ? rankedSchemes[0].scheme : null;
  const llmAnswer = await generateWithGemini(question, rankedSchemes);
  const answer = llmAnswer || buildFallbackAnswer(question, rankedSchemes);
  const liveSources = await fetchLatestAPSources(question);

  const relatedSchemeSources = rankedSchemes
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .flatMap((item) => item.scheme.sources || [])
    .map((url) => ({ type: 'official', url }));

  const sources = [
    ...relatedSchemeSources,
    ...liveSources.map((item) => ({
      type: 'search',
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    })),
  ];

  return {
    answer,
    matchedScheme: topMatch?.name || null,
    scope: 'India (National + State schemes)',
    sources,
    updatedAt: new Date().toISOString(),
  };
}

export async function evaluateSchemeEligibility(profile = {}) {
  const landHectaresFromInput = Number(profile.landHectares || 0);
  const landHectaresFromAcres = Number(profile.landAcres || 0) * 0.404686;
  const landHectares = landHectaresFromInput > 0 ? landHectaresFromInput : landHectaresFromAcres;

  const normalizedProfile = {
    state: profile.state || 'Andhra Pradesh',
    isIndianResident: profile.isIndianResident !== false,
    landHectares,
    annualIncome: parseIncome(profile.annualIncome),
    farmerType: profile.farmerType || 'landowner',
    hasCropCultivation: Boolean(profile.hasCropCultivation),
    hasCropInsuranceNeed: Boolean(profile.hasCropInsuranceNeed),
    needsIrrigation: Boolean(profile.needsIrrigation),
    hasAadhaar: Boolean(profile.hasAadhaar),
    hasBankAccount: Boolean(profile.hasBankAccount),
    hasLandProof: Boolean(profile.hasLandProof),
    isRegisteredCultivator: Boolean(profile.isRegisteredCultivator),
    hasEnrolledBeforeSeason: Boolean(profile.hasEnrolledBeforeSeason),
  };

  normalizedProfile.farmerCategory = normalizedProfile.landHectares < 1
    ? 'marginal'
    : normalizedProfile.landHectares <= 2
      ? 'small'
      : 'other';

  if (normalizedProfile.annualIncome != null && normalizedProfile.annualIncome > DEFAULT_MAX_INCOME) {
    return {
      profile: normalizedProfile,
      eligibleSchemes: [],
      eligibleCount: 0,
      message: `Income exceeds current tracked scheme cap (Gé¦${DEFAULT_MAX_INCOME.toLocaleString('en-IN')}).`,
    };
  }

  const eligibleSchemes = [];

  for (const scheme of INDIA_SCHEMES) {
    const passesSchemeRules = typeof scheme.eligibilityCheck === 'function' ? scheme.eligibilityCheck(normalizedProfile) : false;
    const passesLimits = isWithinSchemeLimits(scheme, normalizedProfile);
    const isEligible = passesSchemeRules && passesLimits;

    if (isEligible) {
      let reason = 'Matches your farmer profile.';

      if (scheme.name === 'YSR Rythu Bharosa') {
        reason = normalizedProfile.landHectares > 0 || normalizedProfile.farmerType === 'tenant'
          ? 'You have cultivable land or tenant-farmer status in Andhra Pradesh.'
          : reason;
      }

      if (scheme.name === 'YSR Free Crop Insurance') {
        reason = normalizedProfile.hasCropCultivation
          ? 'You cultivate a crop and want crop insurance support.'
          : reason;
      }

      if (scheme.name === 'AP Micro Irrigation Project (APMIP)') {
        reason = normalizedProfile.needsIrrigation
          ? 'You need drip or sprinkler irrigation support and have cultivable land.'
          : reason;
      }

      if (scheme.name === 'PM-KISAN') {
        reason = 'You have key baseline requirements: resident farmer profile with Aadhaar, bank, and cultivation/land records.';
      }

      if (scheme.name === 'Pradhan Mantri Fasal Bima Yojana (PMFBY)') {
        reason = 'You cultivate crops and indicated crop-insurance need with seasonal enrollment intent.';
      }

      if (scheme.name === 'Kisan Credit Card (KCC)') {
        reason = 'Your profile matches farmer/cultivator credit eligibility conditions.';
      }

      eligibleSchemes.push(buildSchemeCard(scheme, reason));
    }
  }

  return {
    profile: normalizedProfile,
    eligibleSchemes,
    eligibleCount: eligibleSchemes.length,
    message:
      eligibleSchemes.length > 0
        ? 'These national/state schemes match your profile based on the details provided.'
        : 'No tracked scheme matched all provided details. Update profile fields and retry.',
  };
}
