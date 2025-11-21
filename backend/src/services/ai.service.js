// backend/src/services/ai.service.js

/**
 * AI Service for resume generation and matching
 * Supports both OpenAI and Anthropic Claude
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock'; // 'openai', 'claude', or 'mock'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Generate AI-powered resume
 */
export const generateResume = async (studentProfile, customization = {}) => {
  const {
    targetRole = 'Internship Position',
    targetCompany,
    targetIndustry = 'General',
    template = 'professional',
    emphasis = []
  } = customization;

  const { personalInfo, education, skills, experience } = studentProfile;

  // Build prompt
  const prompt = `Generate a professional resume for the following candidate:

Name: ${personalInfo?.firstName} ${personalInfo?.lastName}
Target Role: ${targetRole}
${targetCompany ? `Target Company: ${targetCompany}` : ''}
Target Industry: ${targetIndustry}

Education:
${education?.map(edu => `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`).join('\n') || 'No education provided'}

Skills:
${skills?.map(skill => `- ${skill.name} (${skill.level})`).join('\n') || 'No skills provided'}

Experience:
${experience?.map(exp => `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})
  ${exp.description}
  Achievements: ${exp.achievements?.join(', ') || 'None'}
`).join('\n') || 'No experience provided'}

Please format this into a professional resume with the following sections:
1. Summary/Objective (tailored to ${targetRole})
2. Education
3. Skills
4. Experience
5. ${emphasis.includes('projects') ? 'Projects' : ''}
6. ${emphasis.includes('certifications') ? 'Certifications' : ''}

Focus on: ${emphasis.join(', ') || 'balanced presentation'}
Template style: ${template}

Return the resume in a structured format with clear sections.`;

  try {
    let resumeContent;

    switch (AI_PROVIDER) {
      case 'openai':
        resumeContent = await generateWithOpenAI(prompt);
        break;
      case 'claude':
        resumeContent = await generateWithClaude(prompt);
        break;
      default:
        resumeContent = generateMockResume(studentProfile, customization);
    }

    // Generate ATS score and analysis
    const analysis = await analyzeResume(resumeContent, targetRole);

    return {
      content: resumeContent,
      analysis,
      aiModel: AI_PROVIDER === 'openai' ? 'gpt-4' : AI_PROVIDER === 'claude' ? 'claude-3-5-sonnet' : 'mock',
      prompt
    };
  } catch (error) {
    console.error('AI resume generation error:', error);
    // Fallback to mock if AI fails
    const resumeContent = generateMockResume(studentProfile, customization);
    const analysis = await analyzeResume(resumeContent, targetRole);

    return {
      content: resumeContent,
      analysis,
      aiModel: 'mock-fallback',
      prompt,
      error: error.message
    };
  }
};

/**
 * Generate resume using OpenAI
 */
async function generateWithOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer specializing in creating ATS-friendly, professional resumes that highlight candidates\' strengths.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate resume using Anthropic Claude
 */
async function generateWithClaude(prompt) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: 'You are an expert resume writer specializing in creating ATS-friendly, professional resumes that highlight candidates\' strengths.'
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Generate mock resume (fallback)
 */
function generateMockResume(studentProfile, customization) {
  const { personalInfo, education, skills, experience } = studentProfile;
  const { targetRole = 'Internship Position', targetCompany, targetIndustry = 'General' } = customization;

  return `
=================================
${personalInfo?.firstName} ${personalInfo?.lastName}
${personalInfo?.email} | ${personalInfo?.phone || ''}
${personalInfo?.location?.city}, ${personalInfo?.location?.country}
=================================

PROFESSIONAL SUMMARY
-------------------
Motivated ${education?.[0]?.degree || 'student'} seeking ${targetRole} ${targetCompany ? `at ${targetCompany}` : ''} in the ${targetIndustry} industry.
Strong foundation in ${skills?.slice(0, 3).map(s => s.name).join(', ') || 'various technologies'} with hands-on experience in ${experience?.[0]?.title || 'professional settings'}.

EDUCATION
---------
${education?.map(edu => `${edu.degree} in ${edu.fieldOfStudy}
${edu.institution}
${edu.startDate} - ${edu.endDate || 'Present'}
GPA: ${edu.gpa || 'N/A'}
`).join('\n') || 'Education details not provided'}

SKILLS
------
${skills?.map(skill => `• ${skill.name} - ${skill.level}`).join('\n') || '• Skills not provided'}

EXPERIENCE
----------
${experience?.map(exp => `${exp.title}
${exp.company} | ${exp.location}
${exp.startDate} - ${exp.endDate || 'Present'}

${exp.description}

Achievements:
${exp.achievements?.map(a => `• ${a}`).join('\n') || '• Key contributions to team success'}
`).join('\n\n') || 'Experience details not provided'}

ADDITIONAL INFORMATION
---------------------
• Strong communication and teamwork skills
• Passionate about ${targetIndustry} and continuous learning
• Available for ${targetRole}
`.trim();
}

/**
 * Analyze resume for ATS compatibility and quality
 */
async function analyzeResume(resumeContent, targetRole) {
  // Extract keywords from resume
  const keywords = extractKeywords(resumeContent);

  // Calculate ATS score (80-100 range)
  const atsScore = calculateATSScore(resumeContent, keywords);

  // Calculate readability score
  const readabilityScore = calculateReadabilityScore(resumeContent);

  // Generate strengths and suggestions
  const strengths = identifyStrengths(resumeContent, keywords);
  const suggestions = generateSuggestions(resumeContent, atsScore, readabilityScore);
  const improvements = generateImprovements(resumeContent);

  return {
    atsScore,
    readabilityScore,
    keywords: keywords.slice(0, 10), // Top 10 keywords
    strengths,
    suggestions,
    improvements
  };
}

/**
 * Extract keywords from resume
 */
function extractKeywords(content) {
  const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const commonWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been', 'will', 'your', 'their', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between']);

  const filteredWords = words.filter(word => !commonWords.has(word));

  // Count frequency
  const frequency = {};
  filteredWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 15);
}

/**
 * Calculate ATS score
 */
function calculateATSScore(content, keywords) {
  let score = 80; // Base score

  // Check for key sections
  if (content.includes('EDUCATION') || content.includes('Education')) score += 3;
  if (content.includes('EXPERIENCE') || content.includes('Experience')) score += 3;
  if (content.includes('SKILLS') || content.includes('Skills')) score += 3;
  if (content.includes('SUMMARY') || content.includes('Summary')) score += 2;

  // Check for quantifiable achievements
  if (/\d+%/.test(content)) score += 3; // Percentages
  if (/\$\d+/.test(content)) score += 2; // Dollar amounts
  if (/\d+ (years?|months?)/.test(content)) score += 2; // Time periods

  // Keyword density
  const keywordScore = Math.min(keywords.length, 5);
  score += keywordScore;

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.trim().length > 0);

  const avgWordsPerSentence = words.length / sentences.length;

  // Ideal: 15-20 words per sentence
  let score = 85;
  if (avgWordsPerSentence < 10) score += 5;
  else if (avgWordsPerSentence > 25) score -= 10;

  // Check for bullet points (good for readability)
  const bulletPoints = (content.match(/[•\-\*]/g) || []).length;
  score += Math.min(bulletPoints, 10);

  return Math.min(Math.round(score), 100);
}

/**
 * Identify resume strengths
 */
function identifyStrengths(content, keywords) {
  const strengths = [];

  if (content.length > 1500) strengths.push('Comprehensive and detailed');
  if (keywords.length > 10) strengths.push('Strong technical vocabulary');
  if (/\d+%|\d+ (years?|months?)/.test(content)) strengths.push('Quantifiable achievements');
  if ((content.match(/[•\-]/g) || []).length > 5) strengths.push('Well-organized with bullet points');

  return strengths.length > 0 ? strengths : ['Clear presentation of qualifications'];
}

/**
 * Generate suggestions for improvement
 */
function generateSuggestions(content, atsScore, readabilityScore) {
  const suggestions = [];

  if (atsScore < 90) suggestions.push('Add more industry-specific keywords');
  if (readabilityScore < 90) suggestions.push('Use more bullet points for better readability');
  if (!content.includes('http')) suggestions.push('Include LinkedIn profile URL');
  if (!/\d+%/.test(content)) suggestions.push('Add quantifiable achievements with percentages');

  return suggestions.length > 0 ? suggestions : ['Resume looks great!'];
}

/**
 * Generate improvement recommendations
 */
function generateImprovements(content) {
  const improvements = [];

  if (!content.includes('SUMMARY') && !content.includes('Summary')) {
    improvements.push('Add a professional summary at the top');
  }
  if ((content.match(/[•\-]/g) || []).length < 5) {
    improvements.push('Use more bullet points to highlight achievements');
  }
  if (!/\d+ (years?|months?)/.test(content)) {
    improvements.push('Specify duration for each role');
  }

  return improvements.length > 0 ? improvements : ['Keep refining based on specific job requirements'];
}

/**
 * Calculate match score between student profile and internship
 */
export const calculateMatchScore = async (studentProfile, internship) => {
  // This is already implemented in matching.controller.js
  // We can enhance it with AI if needed
  return {
    score: 0,
    reasons: [],
    skillsMatch: []
  };
};

export default {
  generateResume,
  analyzeResume,
  calculateMatchScore
};
