// Pricing plans configuration
export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    subtitle: 'For Individuals',
    price: 0,
    priceLabel: 'Free',
    billing: 'Forever',
    description: 'Perfect for personal finance tracking',
    features: [
      'Up to 50 transactions per month',
      'Basic expense categories',
      'Simple dashboard & reports',
      'Mobile responsive design',
      'Email support'
    ],
    limitations: [
      'Limited transaction history (3 months)',
      'Basic charts only',
      'No data export',
      'No advanced filtering'
    ],
    popular: false,
    buttonText: 'Get Started Free',
    icon: '👤'
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For Small & Medium Business',
    price: 29,
    priceLabel: '$29',
    billing: 'per month',
    description: 'Advanced features for growing businesses',
    features: [
      'Unlimited transactions',
      'Advanced analytics & insights',
      'Custom categories & tags',
      'Data export (CSV, PDF)',
      'Multi-currency support',
      'Advanced filtering & search',
      'Monthly & yearly reports',
      'Priority email support',
      'Team collaboration (up to 5 users)',
      'Budget planning & tracking'
    ],
    limitations: [],
    popular: true,
    buttonText: 'Start Pro Trial',
    icon: '🏢'
  },
  ELITE: {
    id: 'elite',
    name: 'Elite',
    subtitle: 'For Large Enterprise',
    price: 99,
    priceLabel: '$99',
    billing: 'per month',
    description: 'Enterprise-grade solution with premium support',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced API access',
      'Custom integrations',
      'White-label options',
      'Advanced security features',
      'Dedicated account manager',
      '24/7 phone & chat support',
      'Custom reporting dashboards',
      'Data backup & recovery',
      'SSO integration',
      'Compliance reporting'
    ],
    limitations: [],
    popular: false,
    buttonText: 'Contact Sales',
    icon: '🏆'
  }
};

export const PLAN_FEATURES = {
  transactions: {
    free: 50,
    pro: 'unlimited',
    elite: 'unlimited'
  },
  users: {
    free: 1,
    pro: 5,
    elite: 'unlimited'
  },
  dataRetention: {
    free: '3 months',
    pro: 'unlimited',
    elite: 'unlimited'
  },
  support: {
    free: 'Email',
    pro: 'Priority Email',
    elite: '24/7 Phone & Chat'
  }
};

export const PLAN_PERMISSIONS = {
  free: [
    'view_transactions',
    'add_transactions',
    'basic_reports'
  ],
  pro: [
    'view_transactions',
    'add_transactions',
    'basic_reports',
    'advanced_reports',
    'export_data',
    'custom_categories',
    'team_collaboration',
    'budget_planning'
  ],
  elite: [
    'view_transactions',
    'add_transactions',
    'basic_reports',
    'advanced_reports',
    'export_data',
    'custom_categories',
    'team_collaboration',
    'budget_planning',
    'api_access',
    'custom_integrations',
    'white_label',
    'advanced_security',
    'compliance_reports'
  ]
};
