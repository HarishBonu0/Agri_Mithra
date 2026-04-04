const toBool = (value, fallback = true) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
	return fallback;
};

const toNumber = (value, fallback = 0) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

const CATALOG = [
	{
		id: 'pm-kisan',
		name: { en: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', te: 'ప్రధాన్ మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)' },
		description: {
			en: 'Direct income support scheme for landholding farmer families.',
			te: 'భూమి కలిగిన రైతు కుటుంబాలకు నేరుగా ఆదాయ మద్దతు అందించే పథకం.',
		},
		reason: {
			en: 'Landholding farmer profile with Aadhaar and bank linkage matches PM-KISAN baseline requirements.',
			te: 'భూమి కలిగిన రైతు ప్రొఫైల్, ఆధార్ మరియు బ్యాంక్ లింకేజ్ ఉండటం PM-KISAN మౌలిక అర్హతలకు సరిపోతుంది.',
		},
		benefit: {
			en: '₹6,000 per year in three equal installments.',
			te: 'సంవత్సరానికి ₹6,000 ను 3 సమాన విడతలుగా అందిస్తారు.',
		},
		applyAt: 'https://pmkisan.gov.in/',
		isEligible: (p) => p.isIndianResident && p.landHectares > 0 && p.hasAadhaar && p.hasBankAccount,
	},
	{
		id: 'pmfby',
		name: { en: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', te: 'ప్రధాన్ మంత్రి ఫసల్ బీమా యోజన (PMFBY)' },
		description: {
			en: 'Crop insurance scheme protecting farmers from weather, pest, and disease-related losses.',
			te: 'వాతావరణం, పురుగులు, వ్యాధుల వల్ల పంట నష్టానికి బీమా రక్షణ అందించే పథకం.',
		},
		reason: {
			en: 'Crop cultivation with insurance need and pre-season enrollment readiness matches PMFBY conditions.',
			te: 'పంట సాగు, బీమా అవసరం మరియు సీజన్ ముందు నమోదు సిద్ధత ఉండటం PMFBY షరతులకు సరిపోతుంది.',
		},
		benefit: {
			en: 'Insurance compensation for notified crop loss under scheme guidelines.',
			te: 'పథక మార్గదర్శకాల ప్రకారం నోటిఫైడ్ పంట నష్టానికి బీమా పరిహారం.',
		},
		applyAt: 'https://pmfby.gov.in/',
		isEligible: (p) => p.hasCropCultivation && p.hasCropInsuranceNeed && p.hasEnrolledBeforeSeason,
	},
	{
		id: 'soil-health-card',
		name: { en: 'Soil Health Card Scheme', te: 'మట్టి ఆరోగ్య కార్డు పథకం' },
		description: {
			en: 'Supports nutrient-based fertilizer planning through soil testing recommendations.',
			te: 'మట్టి పరీక్షల ఆధారంగా సరైన ఎరువుల ప్రణాళికకు సూచనలు అందించే పథకం.',
		},
		reason: {
			en: 'Active cultivation profile qualifies for soil testing and advisory support.',
			te: 'పంట సాగు చేస్తున్న రైతు ప్రొఫైల్‌కు మట్టి పరీక్ష మరియు సలహా సేవలు వర్తిస్తాయి.',
		},
		benefit: {
			en: 'Soil health card with nutrient status and crop-wise input recommendations.',
			te: 'పోషకాల స్థితి మరియు పంటలవారీగా సూచనలతో మట్టి ఆరోగ్య కార్డు.',
		},
		applyAt: 'https://soilhealth.dac.gov.in/',
		isEligible: (p) => p.hasCropCultivation,
	},
	{
		id: 'e-nam',
		name: { en: 'National Agriculture Market (e-NAM)', te: 'జాతీయ వ్యవసాయ మార్కెట్ (e-NAM)' },
		description: {
			en: 'Online agri-market platform for better price discovery and broader market access.',
			te: 'మంచి ధరలు మరియు విస్తృత మార్కెట్ యాక్సెస్ కోసం ఆన్‌లైన్ వ్యవసాయ మార్కెట్ వేదిక.',
		},
		reason: {
			en: 'Farm produce sellers can use e-NAM for transparent market access.',
			te: 'పంట ఉత్పత్తులు అమ్మే రైతులు పారదర్శక మార్కెట్ యాక్సెస్ కోసం e-NAM ఉపయోగించవచ్చు.',
		},
		benefit: {
			en: 'Access to wider mandi network and better market linkage.',
			te: 'విస్తృత మండీ నెట్‌వర్క్ మరియు మెరుగైన మార్కెట్ కనెక్టివిటీ.',
		},
		applyAt: 'https://www.enam.gov.in/',
		isEligible: (p) => p.hasCropCultivation,
	},
	{
		id: 'pmksy-micro-irrigation',
		name: { en: 'PMKSY - Per Drop More Crop (Micro Irrigation)', te: 'PMKSY - పర్ డ్రాప్ మోర్ క్రాప్ (సూక్ష్మ నీటిపారుదల)' },
		description: {
			en: 'Promotes efficient irrigation systems with subsidy support under applicable state norms.',
			te: 'రాష్ట్ర నియమాల ప్రకారం సబ్సిడీతో సమర్థవంతమైన నీటిపారుదల వ్యవస్థలను ప్రోత్సహించే పథకం.',
		},
		reason: {
			en: 'Irrigation requirement with small-to-medium landholding is typically prioritized under micro irrigation support.',
			te: 'నీటిపారుదల అవసరం మరియు చిన్న-మధ్య స్థాయి భూవిస్తీర్ణం ఉన్న రైతులకు సూక్ష్మ నీటిపారుదల మద్దతు సాధారణంగా ప్రాధాన్యంగా ఉంటుంది.',
		},
		benefit: {
			en: 'Subsidy support for drip/sprinkler setup as per state implementation rules.',
			te: 'రాష్ట్ర అమలు నియమాల ప్రకారం డ్రిప్/స్ప్రింక్లర్ ఏర్పాటుకు సబ్సిడీ మద్దతు.',
		},
		applyAt: 'https://pmksy.gov.in/',
		isEligible: (p) => p.needsIrrigation && p.landHectares > 0 && p.landHectares <= 10,
	},
];

const normalizeProfile = ({ land, income, state, language = 'en', ...rest }) => {
	const landAcres = toNumber(land, 0);
	const landHectares = rest.landHectares
		? toNumber(rest.landHectares, 0)
		: landAcres > 0
			? landAcres * 0.404686
			: 0;

	return {
		state: String(state || rest.state || 'India').trim(),
		language: language === 'te' ? 'te' : 'en',
		landHectares,
		annualIncome: toNumber(income ?? rest.annualIncome, 0),
		isIndianResident: toBool(rest.isIndianResident, true),
		hasCropCultivation: toBool(rest.hasCropCultivation, true),
		hasCropInsuranceNeed: toBool(rest.hasCropInsuranceNeed, true),
		needsIrrigation: toBool(rest.needsIrrigation, true),
		hasAadhaar: toBool(rest.hasAadhaar, true),
		hasBankAccount: toBool(rest.hasBankAccount, true),
		hasEnrolledBeforeSeason: toBool(rest.hasEnrolledBeforeSeason, true),
	};
};

export const generateSchemes = async (input) => {
	const profile = normalizeProfile(input || {});
	const language = profile.language;

	const eligible = CATALOG.filter((scheme) => scheme.isEligible(profile)).map((scheme) => ({
		name: scheme.name[language],
		description: scheme.description[language],
		eligibility: scheme.reason[language],
		benefit: scheme.benefit[language],
		applyAt: scheme.applyAt,
	}));

	return eligible;
};

export default generateSchemes;