// backend/src/services/premium.service.js

/**
 * 🎯 PREMIUM FEATURES SERVICE
 *
 * Handles all premium-tier features for Student Premium plan:
 * 1. Resume Optimization Tips
 * 2. Interview Preparation Guide
 * 3. Priority Support
 * 4. Advanced Insights
 */

/**
 * Generate resume optimization tips based on resume content and ATS score
 */
export const generateResumeOptimizationTips = (resume, atsAnalysis) => {
  const tips = {
    critical: [],
    important: [],
    suggestions: [],
    strengths: []
  };

  const { atsScore, readabilityScore, keywords } = atsAnalysis;

  // Critical tips (ATS Score < 70)
  if (atsScore < 70) {
    tips.critical.push({
      category: 'ATS Compatibility',
      tip: 'Your resume may not pass Applicant Tracking Systems',
      action: 'Add more industry-specific keywords and use standard formatting',
      impact: 'high',
      priority: 1
    });
  }

  // Keyword optimization
  if (!keywords || keywords.length < 5) {
    tips.critical.push({
      category: 'Keywords',
      tip: 'Insufficient keywords for your target role',
      action: 'Include technical skills, tools, and industry terms from job descriptions',
      impact: 'high',
      priority: 2
    });
  }

  // Readability
  if (readabilityScore < 80) {
    tips.important.push({
      category: 'Readability',
      tip: 'Resume is hard to scan quickly',
      action: 'Use bullet points, shorter sentences, and clear section headers',
      impact: 'medium',
      priority: 3
    });
  }

  // Quantifiable achievements
  const content = JSON.stringify(resume.content || resume);
  const hasNumbers = /\d+%|\d+ (users?|clients?|projects?|applications?)/i.test(content);

  if (!hasNumbers) {
    tips.important.push({
      category: 'Impact',
      tip: 'Missing quantifiable achievements',
      action: 'Add metrics: "Improved performance by 40%" or "Managed 5 projects"',
      impact: 'high',
      priority: 4
    });
  }

  // Action verbs
  const weakVerbs = /(responsible for|worked on|helped with)/i.test(content);
  if (weakVerbs) {
    tips.suggestions.push({
      category: 'Language',
      tip: 'Using weak action verbs',
      action: 'Replace with strong verbs: Led, Developed, Implemented, Achieved, Optimized',
      impact: 'medium',
      priority: 5
    });
  }

  // Professional summary
  if (!content.includes('summary') && !content.includes('objective')) {
    tips.suggestions.push({
      category: 'Structure',
      tip: 'Missing professional summary',
      action: 'Add a 2-3 sentence summary highlighting your top skills and career goals',
      impact: 'medium',
      priority: 6
    });
  }

  // Contact information
  const hasLinkedIn = /linkedin\.com|github\.com|portfolio/i.test(content);
  if (!hasLinkedIn) {
    tips.suggestions.push({
      category: 'Networking',
      tip: 'No online profiles linked',
      action: 'Add LinkedIn, GitHub, or portfolio URLs to increase credibility',
      impact: 'low',
      priority: 7
    });
  }

  // Strengths
  if (atsScore >= 85) {
    tips.strengths.push('Excellent ATS compatibility');
  }
  if (readabilityScore >= 85) {
    tips.strengths.push('Highly readable and well-structured');
  }
  if (keywords && keywords.length >= 10) {
    tips.strengths.push('Strong keyword optimization');
  }

  return {
    tips,
    overallScore: Math.round((atsScore + readabilityScore) / 2),
    summary: generateOptimizationSummary(tips)
  };
};

/**
 * Generate personalized interview preparation guide
 */
export const generateInterviewPreparationGuide = (studentProfile, internship) => {
  const guide = {
    overview: {
      role: internship.title,
      company: internship.organization?.name || internship.company,
      industry: internship.industry || 'Technology',
      level: internship.experienceLevel || 'Entry Level'
    },
    preparation: {
      technical: [],
      behavioral: [],
      companyResearch: [],
      questions: []
    },
    timeline: {
      oneWeekBefore: [],
      threeDaysBefore: [],
      oneDayBefore: [],
      dayOf: []
    },
    tips: []
  };

  // Technical preparation based on required skills
  const requiredSkills = internship.requirements?.skills || [];
  requiredSkills.slice(0, 5).forEach(skill => {
    guide.preparation.technical.push({
      skill,
      focus: `Review ${skill} fundamentals and be ready to discuss projects where you used it`,
      resources: [
        `Practice ${skill} coding challenges on LeetCode/HackerRank`,
        `Review ${skill} documentation and best practices`,
        `Prepare 2-3 examples of ${skill} usage in your projects`
      ]
    });
  });

  // Behavioral questions based on role
  guide.preparation.behavioral = [
    {
      question: 'Tell me about yourself',
      framework: 'Present-Past-Future',
      tip: 'Keep it to 2 minutes, focus on relevant experience'
    },
    {
      question: 'Why do you want this internship?',
      framework: 'Role-Company-Growth',
      tip: 'Show genuine interest in the role and company mission'
    },
    {
      question: 'Describe a challenging project you worked on',
      framework: 'STAR Method (Situation-Task-Action-Result)',
      tip: 'Quantify the impact and what you learned'
    },
    {
      question: 'How do you handle tight deadlines?',
      framework: 'Example-Process-Outcome',
      tip: 'Show time management and prioritization skills'
    },
    {
      question: 'Where do you see yourself in 5 years?',
      framework: 'Aspiration-Skill Development-Value',
      tip: 'Align your goals with the company\'s growth path'
    }
  ];

  // Company research checklist
  guide.preparation.companyResearch = [
    'Read the company\'s "About Us" and mission statement',
    'Review recent news articles and press releases',
    'Check the company\'s products/services and latest features',
    'Understand their competitors and market position',
    'Look up the interviewer on LinkedIn',
    'Prepare 3-5 thoughtful questions about the company'
  ];

  // Questions to ask interviewer
  guide.preparation.questions = [
    'What does a typical day look like for an intern in this role?',
    'What are the biggest challenges the team is currently facing?',
    'How is success measured for this internship position?',
    'What opportunities are there for learning and professional development?',
    'What is the team structure and who would I be working with?',
    'What projects would I be working on during the internship?'
  ];

  // Timeline
  guide.timeline.oneWeekBefore = [
    'Research the company thoroughly',
    'Prepare answers to common interview questions using STAR method',
    'Review your resume and be ready to discuss every point',
    'Practice technical skills relevant to the role',
    'Prepare questions to ask the interviewer'
  ];

  guide.timeline.threeDaysBefore = [
    'Do a mock interview with a friend or mentor',
    'Review your prepared answers and refine them',
    'Research the interviewer(s) on LinkedIn',
    'Prepare your interview outfit',
    'Test your tech setup (camera, microphone, internet) if virtual'
  ];

  guide.timeline.oneDayBefore = [
    'Review company website and recent news one more time',
    'Print copies of your resume (or have digital ready)',
    'Prepare notepad and pen for notes',
    'Get a good night\'s sleep (7-8 hours)',
    'Plan your route/login details and arrive 10 minutes early'
  ];

  guide.timeline.dayOf = [
    'Eat a good breakfast',
    'Dress professionally (business casual minimum)',
    'Arrive 10-15 minutes early (or log in 5 minutes early for virtual)',
    'Bring resume copies, notepad, and pen',
    'Smile, make eye contact, and show enthusiasm',
    'Send a thank-you email within 24 hours'
  ];

  // General tips
  guide.tips = [
    {
      category: 'Body Language',
      tip: 'Maintain good posture, smile, and make eye contact',
      why: 'Shows confidence and engagement'
    },
    {
      category: 'Communication',
      tip: 'Speak clearly and concisely, avoid rambling',
      why: 'Demonstrates clear thinking and professionalism'
    },
    {
      category: 'Enthusiasm',
      tip: 'Show genuine excitement about the role and company',
      why: 'Culture fit is as important as technical skills'
    },
    {
      category: 'Honesty',
      tip: 'If you don\'t know something, say so and explain how you\'d learn it',
      why: 'Honesty and learning ability are valued traits'
    },
    {
      category: 'Follow-up',
      tip: 'Send a personalized thank-you email within 24 hours',
      why: 'Shows professionalism and continued interest'
    }
  ];

  return guide;
};

/**
 * Check if user has priority support (Premium/Pro)
 */
export const hasPrioritySupport = (user) => {
  const plan = user.subscription?.plan || 'free';
  return ['premium', 'pro'].includes(plan);
};

/**
 * Generate priority badge data
 */
export const getPriorityBadgeData = (user) => {
  const plan = user.subscription?.plan || 'free';

  if (plan === 'pro') {
    return {
      enabled: true,
      tier: 'pro',
      label: 'Pro Applicant',
      color: 'gold',
      icon: 'crown',
      benefits: [
        'Priority application review',
        'Featured profile',
        'Direct messaging with recruiters',
        'Unlimited AI resumes'
      ]
    };
  }

  if (plan === 'premium') {
    return {
      enabled: true,
      tier: 'premium',
      label: 'Premium Applicant',
      color: 'blue',
      icon: 'star',
      benefits: [
        'Priority application review',
        '10 AI resumes per month',
        'Advanced search filters',
        'Interview preparation guides'
      ]
    };
  }

  return {
    enabled: false,
    tier: 'free',
    label: null,
    color: null,
    icon: null,
    benefits: []
  };
};

/**
 * Helper: Generate optimization summary
 */
function generateOptimizationSummary(tips) {
  const totalIssues = tips.critical.length + tips.important.length + tips.suggestions.length;
  const criticalCount = tips.critical.length;

  if (criticalCount > 0) {
    return `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} found. Fix these first to improve your chances.`;
  }

  if (totalIssues === 0) {
    return 'Your resume is well-optimized! Keep refining based on specific job requirements.';
  }

  return `${totalIssues} optimization${totalIssues > 1 ? 's' : ''} available. Address these to stand out.`;
}

export default {
  generateResumeOptimizationTips,
  generateInterviewPreparationGuide,
  hasPrioritySupport,
  getPriorityBadgeData
};
