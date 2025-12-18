// backend/src/services/pdf.service.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 🎓 PDF GENERATION SERVICE
 *
 * Generates professional resumes in PDF format using pdfkit
 * Now supports 4 distinct templates:
 * - Professional: Conservative, clean, formal (Times, traditional)
 * - Creative: Expressive, modern, visually dynamic (colors, bold design)
 * - Modern: Clean, tech-forward, structured (Helvetica, blue accents)
 * - Minimal: Sparse, high white space, content-first (simple, elegant)
 */

// ═══════════════════════════════════════════════════════════
// TEMPLATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════

const TEMPLATES = {
  professional: {
    name: 'Professional',
    fonts: {
      heading: 'Times-Bold',
      subheading: 'Times-Bold',
      body: 'Times-Roman',
      emphasis: 'Times-Italic'
    },
    colors: {
      primary: '#2C3E50',      // Dark gray-blue (conservative)
      text: '#000000',          // Pure black (formal)
      light: '#555555',         // Medium gray
      accent: '#34495E'         // Darker shade
    },
    sizes: {
      name: 24,
      heading: 13,
      subheading: 11,
      body: 10,
      small: 9
    },
    spacing: {
      sectionGap: 20,
      itemGap: 12,
      lineHeight: 1.4
    },
    layout: {
      margins: { top: 60, bottom: 60, left: 70, right: 70 },
      useUnderlines: true,
      useBullets: true,
      sectionDividers: 'underline'
    }
  },

  creative: {
    name: 'Creative',
    fonts: {
      heading: 'Helvetica-Bold',
      subheading: 'Helvetica-Bold',
      body: 'Helvetica',
      emphasis: 'Helvetica-Oblique'
    },
    colors: {
      primary: '#E74C3C',       // Bold red (expressive)
      text: '#2C3E50',          // Dark blue-gray
      light: '#7F8C8D',         // Cool gray
      accent: '#3498DB'         // Vibrant blue
    },
    sizes: {
      name: 32,
      heading: 16,
      subheading: 12,
      body: 10,
      small: 9
    },
    spacing: {
      sectionGap: 25,
      itemGap: 15,
      lineHeight: 1.5
    },
    layout: {
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      useUnderlines: false,
      useBullets: true,
      sectionDividers: 'box',
      coloredHeaders: true
    }
  },

  modern: {
    name: 'Modern',
    fonts: {
      heading: 'Helvetica-Bold',
      subheading: 'Helvetica-Bold',
      body: 'Helvetica',
      emphasis: 'Helvetica-Oblique'
    },
    colors: {
      primary: '#0078D4',       // Microsoft Blue (tech-forward)
      text: '#1F1F1F',          // Almost black
      light: '#666666',         // Medium gray
      accent: '#00BCF2'         // Cyan accent
    },
    sizes: {
      name: 28,
      heading: 14,
      subheading: 12,
      body: 11,
      small: 10
    },
    spacing: {
      sectionGap: 22,
      itemGap: 14,
      lineHeight: 1.45
    },
    layout: {
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      useUnderlines: false,
      useBullets: true,
      sectionDividers: 'line'
    }
  },

  minimal: {
    name: 'Minimal',
    fonts: {
      heading: 'Helvetica-Bold',
      subheading: 'Helvetica',
      body: 'Helvetica',
      emphasis: 'Helvetica-Oblique'
    },
    colors: {
      primary: '#000000',       // Pure black (minimal)
      text: '#000000',          // Pure black
      light: '#999999',         // Light gray
      accent: '#666666'         // Medium gray
    },
    sizes: {
      name: 22,
      heading: 12,
      subheading: 10,
      body: 10,
      small: 9
    },
    spacing: {
      sectionGap: 30,           // Extra space (content-first)
      itemGap: 18,
      lineHeight: 1.6
    },
    layout: {
      margins: { top: 70, bottom: 70, left: 60, right: 60 },
      useUnderlines: false,
      useBullets: false,        // No bullets for minimal
      sectionDividers: 'space'
    }
  }
};

/**
 * Generate Resume PDF with template support
 * @param {Object} studentProfile - Student profile data
 * @param {Object} resumeContent - AI-generated content
 * @param {String} fileName - Output file name
 * @param {String} template - Template name (professional, creative, modern, minimal)
 * @returns {Promise<String>} - Path to generated PDF
 */
export const generateResumePDF = async (studentProfile, resumeContent, fileName, template = 'professional') => {
  return new Promise((resolve, reject) => {
    try {
      // Get template config
      const config = TEMPLATES[template] || TEMPLATES.professional;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const outputPath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({
        size: 'A4',
        margins: config.layout.margins
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Render based on template
      switch (template) {
        case 'creative':
          renderCreativeTemplate(doc, studentProfile, resumeContent, config);
          break;
        case 'modern':
          renderModernTemplate(doc, studentProfile, resumeContent, config);
          break;
        case 'minimal':
          renderMinimalTemplate(doc, studentProfile, resumeContent, config);
          break;
        case 'professional':
        default:
          renderProfessionalTemplate(doc, studentProfile, resumeContent, config);
          break;
      }

      // Add footer to all pages
      addFooter(doc, config);

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
};

// ═══════════════════════════════════════════════════════════
// PROFESSIONAL TEMPLATE RENDERER
// Conservative, clean, formal with Times font
// ═══════════════════════════════════════════════════════════

function renderProfessionalTemplate(doc, studentProfile, resumeContent, config) {
  const { personalInfo } = studentProfile;
  const { margins } = config.layout;
  const pageWidth = 595 - margins.left - margins.right; // A4 width
  let y = margins.top;

  // === HEADER (Centered, Conservative) ===
  const fullName = `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim().toUpperCase();

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.name)
    .fillColor(config.colors.primary)
    .text(fullName, margins.left, y, { width: pageWidth, align: 'center' });

  y = doc.y + 5;

  // Target Role
  if (resumeContent?.targetRole) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.subheading)
      .fillColor(config.colors.text)
      .text(resumeContent.targetRole, margins.left, y, { width: pageWidth, align: 'center' });

    y = doc.y + 3;
  }

  // Contact Info (Centered)
  const contactInfo = [];
  if (studentProfile.user?.email) contactInfo.push(studentProfile.user.email);
  if (personalInfo?.phone) contactInfo.push(personalInfo.phone);
  if (personalInfo?.location?.city && personalInfo?.location?.country) {
    contactInfo.push(`${personalInfo.location.city}, ${personalInfo.location.country}`);
  }

  if (contactInfo.length > 0) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.small)
      .fillColor(config.colors.light)
      .text(contactInfo.join(' | '), margins.left, y, { width: pageWidth, align: 'center' });

    y = doc.y + config.spacing.sectionGap;
  }

  // Horizontal divider line
  doc
    .strokeColor(config.colors.primary)
    .lineWidth(1)
    .moveTo(margins.left, y)
    .lineTo(margins.left + pageWidth, y)
    .stroke();

  y += config.spacing.sectionGap;

  // === PROFESSIONAL SUMMARY ===
  if (resumeContent?.summary || personalInfo?.bio) {
    y = addSection(doc, 'PROFESSIONAL SUMMARY', y, config, margins, pageWidth);

    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(resumeContent?.summary || personalInfo?.bio, margins.left, y, {
        width: pageWidth,
        align: 'justify',
        lineGap: 2
      });

    y = doc.y + config.spacing.sectionGap;
  }

  // === EDUCATION ===
  y = renderEducation(doc, studentProfile, y, config, margins, pageWidth);

  // === SKILLS ===
  y = renderSkills(doc, studentProfile, y, config, margins, pageWidth);

  // === EXPERIENCE ===
  y = renderExperience(doc, studentProfile, y, config, margins, pageWidth);

  // === PROJECTS ===
  y = renderProjects(doc, studentProfile, y, config, margins, pageWidth);
}

// ═══════════════════════════════════════════════════════════
// CREATIVE TEMPLATE RENDERER
// Expressive, modern, visually dynamic with color accents
// ═══════════════════════════════════════════════════════════

function renderCreativeTemplate(doc, studentProfile, resumeContent, config) {
  const { personalInfo } = studentProfile;
  const { margins } = config.layout;
  const pageWidth = 595 - margins.left - margins.right;
  let y = margins.top;

  // === CREATIVE HEADER (Large, Bold, Colored) ===
  const fullName = `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim();

  // Color block background for name
  doc
    .rect(margins.left - 10, y - 10, pageWidth + 20, 50)
    .fill(config.colors.primary);

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.name)
    .fillColor('#FFFFFF')
    .text(fullName, margins.left, y + 8, { width: pageWidth, align: 'left' });

  y += 55;

  // Target Role with accent color
  if (resumeContent?.targetRole) {
    doc
      .font(config.fonts.subheading)
      .fontSize(config.sizes.heading - 2)
      .fillColor(config.colors.accent)
      .text(resumeContent.targetRole, margins.left, y);

    y = doc.y + 10;
  }

  // Contact Info (left-aligned with icons effect)
  const contactInfo = [];
  if (studentProfile.user?.email) contactInfo.push(`✉ ${studentProfile.user.email}`);
  if (personalInfo?.phone) contactInfo.push(`☎ ${personalInfo.phone}`);
  if (personalInfo?.location?.city && personalInfo?.location?.country) {
    contactInfo.push(`📍 ${personalInfo.location.city}, ${personalInfo.location.country}`);
  }

  if (contactInfo.length > 0) {
    contactInfo.forEach(info => {
      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.small)
        .fillColor(config.colors.text)
        .text(info, margins.left, y);
      y = doc.y + 3;
    });

    y += config.spacing.sectionGap;
  }

  // === SUMMARY ===
  if (resumeContent?.summary || personalInfo?.bio) {
    y = addCreativeSection(doc, 'ABOUT ME', y, config, margins, pageWidth);

    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(resumeContent?.summary || personalInfo?.bio, margins.left, y, {
        width: pageWidth,
        align: 'left',
        lineGap: 3
      });

    y = doc.y + config.spacing.sectionGap;
  }

  // === REST OF SECTIONS ===
  y = renderEducation(doc, studentProfile, y, config, margins, pageWidth, true);
  y = renderSkills(doc, studentProfile, y, config, margins, pageWidth, true);
  y = renderExperience(doc, studentProfile, y, config, margins, pageWidth, true);
  y = renderProjects(doc, studentProfile, y, config, margins, pageWidth, true);
}

// ═══════════════════════════════════════════════════════════
// MODERN TEMPLATE RENDERER
// Clean, tech-forward, structured with blue accents
// ═══════════════════════════════════════════════════════════

function renderModernTemplate(doc, studentProfile, resumeContent, config) {
  const { personalInfo } = studentProfile;
  const { margins } = config.layout;
  const pageWidth = 595 - margins.left - margins.right;
  let y = margins.top;

  // === MODERN HEADER (Clean, Tech-style) ===
  const fullName = `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim().toUpperCase();

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.name)
    .fillColor(config.colors.text)
    .text(fullName, margins.left, y);

  y = doc.y + 3;

  // Target Role (Blue accent)
  if (resumeContent?.targetRole) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.heading)
      .fillColor(config.colors.primary)
      .text(resumeContent.targetRole, margins.left, y);

    y = doc.y + 8;
  }

  // Contact Info (Inline with separators)
  const contactInfo = [];
  if (studentProfile.user?.email) contactInfo.push(studentProfile.user.email);
  if (personalInfo?.phone) contactInfo.push(personalInfo.phone);
  if (personalInfo?.location?.city && personalInfo?.location?.country) {
    contactInfo.push(`${personalInfo.location.city}, ${personalInfo.location.country}`);
  }

  if (contactInfo.length > 0) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.small)
      .fillColor(config.colors.light)
      .text(contactInfo.join('  •  '), margins.left, y);

    y = doc.y + 5;
  }

  // Horizontal line separator
  doc
    .strokeColor(config.colors.primary)
    .lineWidth(2)
    .moveTo(margins.left, y)
    .lineTo(margins.left + pageWidth, y)
    .stroke();

  y += config.spacing.sectionGap;

  // === REST OF SECTIONS (Modern style) ===
  if (resumeContent?.summary || personalInfo?.bio) {
    y = addSection(doc, 'PROFESSIONAL SUMMARY', y, config, margins, pageWidth);

    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(resumeContent?.summary || personalInfo?.bio, margins.left, y, {
        width: pageWidth,
        align: 'justify',
        lineGap: 2
      });

    y = doc.y + config.spacing.sectionGap;
  }

  y = renderEducation(doc, studentProfile, y, config, margins, pageWidth);
  y = renderSkills(doc, studentProfile, y, config, margins, pageWidth);
  y = renderExperience(doc, studentProfile, y, config, margins, pageWidth);
  y = renderProjects(doc, studentProfile, y, config, margins, pageWidth);
}

// ═══════════════════════════════════════════════════════════
// MINIMAL TEMPLATE RENDERER
// Sparse, high white space, content-first
// ═══════════════════════════════════════════════════════════

function renderMinimalTemplate(doc, studentProfile, resumeContent, config) {
  const { personalInfo } = studentProfile;
  const { margins } = config.layout;
  const pageWidth = 595 - margins.left - margins.right;
  let y = margins.top;

  // === MINIMAL HEADER (Simple, Elegant) ===
  const fullName = `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim();

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.name)
    .fillColor(config.colors.primary)
    .text(fullName, margins.left, y);

  y = doc.y + 8;

  // Target Role (subtle)
  if (resumeContent?.targetRole) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.subheading)
      .fillColor(config.colors.light)
      .text(resumeContent.targetRole, margins.left, y);

    y = doc.y + 15;
  }

  // Contact Info (vertical list, plenty of space)
  if (studentProfile.user?.email) {
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.small)
      .fillColor(config.colors.light)
      .text(studentProfile.user.email, margins.left, y);
    y = doc.y + 4;
  }

  if (personalInfo?.phone) {
    doc.text(personalInfo.phone, margins.left, y);
    y = doc.y + 4;
  }

  if (personalInfo?.location?.city && personalInfo?.location?.country) {
    doc.text(`${personalInfo.location.city}, ${personalInfo.location.country}`, margins.left, y);
    y = doc.y;
  }

  y += config.spacing.sectionGap;

  // === REST OF SECTIONS (Minimal style - lots of breathing room) ===
  if (resumeContent?.summary || personalInfo?.bio) {
    y = addMinimalSection(doc, 'Summary', y, config, margins, pageWidth);

    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(resumeContent?.summary || personalInfo?.bio, margins.left, y, {
        width: pageWidth,
        align: 'left',
        lineGap: 4
      });

    y = doc.y + config.spacing.sectionGap;
  }

  y = renderEducation(doc, studentProfile, y, config, margins, pageWidth, false, true);
  y = renderSkills(doc, studentProfile, y, config, margins, pageWidth, false, true);
  y = renderExperience(doc, studentProfile, y, config, margins, pageWidth, false, true);
  y = renderProjects(doc, studentProfile, y, config, margins, pageWidth, false, true);
}

// ═══════════════════════════════════════════════════════════
// SHARED SECTION RENDERERS
// ═══════════════════════════════════════════════════════════

function addSection(doc, title, y, config, margins, pageWidth) {
  if (y > 700) {
    doc.addPage();
    y = margins.top;
  }

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.heading)
    .fillColor(config.colors.primary)
    .text(title, margins.left, y);

  y = doc.y + 3;

  if (config.layout.sectionDividers === 'underline') {
    doc
      .strokeColor(config.colors.primary)
      .lineWidth(0.5)
      .moveTo(margins.left, y)
      .lineTo(margins.left + pageWidth, y)
      .stroke();
    y += 12;
  } else if (config.layout.sectionDividers === 'line') {
    doc
      .strokeColor(config.colors.primary)
      .lineWidth(2)
      .moveTo(margins.left, y)
      .lineTo(margins.left + 60, y)
      .stroke();
    y += 15;
  } else {
    y += 12;
  }

  return y;
}

function addCreativeSection(doc, title, y, config, margins, pageWidth) {
  if (y > 700) {
    doc.addPage();
    y = margins.top;
  }

  // Colored box for section title
  doc
    .rect(margins.left - 5, y - 2, 5, config.sizes.heading + 4)
    .fill(config.colors.primary);

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.heading)
    .fillColor(config.colors.primary)
    .text(title, margins.left + 5, y);

  return doc.y + 15;
}

function addMinimalSection(doc, title, y, config, margins, pageWidth) {
  if (y > 700) {
    doc.addPage();
    y = margins.top;
  }

  doc
    .font(config.fonts.heading)
    .fontSize(config.sizes.heading)
    .fillColor(config.colors.primary)
    .text(title, margins.left, y);

  return doc.y + 15;
}

function renderEducation(doc, studentProfile, y, config, margins, pageWidth, isCreative = false, isMinimal = false) {
  if (!studentProfile.education || studentProfile.education.length === 0) return y;

  if (y > 650) {
    doc.addPage();
    y = margins.top;
  }

  if (isCreative) {
    y = addCreativeSection(doc, 'EDUCATION', y, config, margins, pageWidth);
  } else if (isMinimal) {
    y = addMinimalSection(doc, 'Education', y, config, margins, pageWidth);
  } else {
    y = addSection(doc, 'EDUCATION', y, config, margins, pageWidth);
  }

  studentProfile.education.forEach((edu) => {
    if (y > 700) {
      doc.addPage();
      y = margins.top;
    }

    // Institution
    doc
      .font(config.fonts.subheading)
      .fontSize(config.sizes.subheading)
      .fillColor(config.colors.text)
      .text(edu.institution || 'Institution', margins.left, y);

    y = doc.y + 2;

    // Degree
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(`${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'}`, margins.left, y);

    y = doc.y + 2;

    // Date & GPA
    const eduDetails = [];
    if (edu.startDate || edu.endDate) {
      const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : '';
      const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';
      eduDetails.push(`${startYear} - ${endYear}`);
    }
    if (edu.gpa) {
      eduDetails.push(`GPA: ${edu.gpa}`);
    }

    if (eduDetails.length > 0) {
      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.small)
        .fillColor(config.colors.light)
        .text(eduDetails.join('  •  '), margins.left, y);

      y = doc.y + config.spacing.itemGap;
    } else {
      y += config.spacing.itemGap;
    }
  });

  return y + (isMinimal ? 10 : 5);
}

function renderSkills(doc, studentProfile, y, config, margins, pageWidth, isCreative = false, isMinimal = false) {
  if (!studentProfile.skills || studentProfile.skills.length === 0) return y;

  if (y > 650) {
    doc.addPage();
    y = margins.top;
  }

  if (isCreative) {
    y = addCreativeSection(doc, 'SKILLS', y, config, margins, pageWidth);
  } else if (isMinimal) {
    y = addMinimalSection(doc, 'Skills', y, config, margins, pageWidth);
  } else {
    y = addSection(doc, 'SKILLS', y, config, margins, pageWidth);
  }

  // Group skills by category
  const skillsByCategory = studentProfile.skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill.name);
    return acc;
  }, {});

  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    if (y > 700) {
      doc.addPage();
      y = margins.top;
    }

    if (isMinimal) {
      doc
        .font(config.fonts.subheading)
        .fontSize(config.sizes.body)
        .fillColor(config.colors.text)
        .text(category, margins.left, y);

      y = doc.y + 3;

      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.body)
        .fillColor(config.colors.text)
        .text(skills.join(', '), margins.left, y, { width: pageWidth });

      y = doc.y + config.spacing.itemGap;
    } else {
      doc
        .font(config.fonts.subheading)
        .fontSize(config.sizes.body)
        .fillColor(config.colors.text)
        .text(`${category}:`, margins.left, y, { continued: true })
        .font(config.fonts.body)
        .fillColor(config.colors.text)
        .text(` ${skills.join(', ')}`, { width: pageWidth });

      y = doc.y + (isCreative ? 10 : 8);
    }
  });

  return y + (isMinimal ? 10 : 5);
}

function renderExperience(doc, studentProfile, y, config, margins, pageWidth, isCreative = false, isMinimal = false) {
  if (!studentProfile.experience || studentProfile.experience.length === 0) return y;

  if (y > 650) {
    doc.addPage();
    y = margins.top;
  }

  if (isCreative) {
    y = addCreativeSection(doc, 'EXPERIENCE', y, config, margins, pageWidth);
  } else if (isMinimal) {
    y = addMinimalSection(doc, 'Experience', y, config, margins, pageWidth);
  } else {
    y = addSection(doc, 'EXPERIENCE', y, config, margins, pageWidth);
  }

  studentProfile.experience.forEach((exp) => {
    if (y > 650) {
      doc.addPage();
      y = margins.top;
    }

    // Job Title
    doc
      .font(config.fonts.subheading)
      .fontSize(config.sizes.subheading)
      .fillColor(config.colors.text)
      .text(exp.title || 'Position', margins.left, y);

    y = doc.y + 2;

    // Company
    doc
      .font(config.fonts.body)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(exp.company || 'Company', margins.left, y);

    y = doc.y + 2;

    // Dates
    if (exp.startDate || exp.endDate) {
      const startDate = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.small)
        .fillColor(config.colors.light)
        .text(`${startDate} - ${endDate}`, margins.left, y);

      y = doc.y + 8;
    }

    // Description
    if (exp.description) {
      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.body)
        .fillColor(config.colors.text)
        .text(exp.description, margins.left, y, {
          width: pageWidth,
          align: 'left',
          lineGap: 1
        });

      y = doc.y + 5;
    }

    // Achievements (bullet points or minimal dashes)
    if (exp.achievements && exp.achievements.length > 0) {
      exp.achievements.forEach((achievement) => {
        if (y > 720) {
          doc.addPage();
          y = margins.top;
        }

        if (isMinimal) {
          // No bullets for minimal - just text with indent
          doc
            .font(config.fonts.body)
            .fontSize(config.sizes.body)
            .fillColor(config.colors.text)
            .text(achievement, margins.left + 10, y, { width: pageWidth - 10, lineGap: 1 });
        } else {
          // Bullets for other templates
          doc
            .font(config.fonts.body)
            .fontSize(config.sizes.body)
            .fillColor(config.colors.text)
            .text('•', margins.left + 10, y, { continued: true })
            .text(` ${achievement}`, { width: pageWidth - 10, lineGap: 1 });
        }

        y = doc.y + 4;
      });
    }

    y += config.spacing.itemGap;
  });

  return y;
}

function renderProjects(doc, studentProfile, y, config, margins, pageWidth, isCreative = false, isMinimal = false) {
  if (!studentProfile.projects || studentProfile.projects.length === 0) return y;

  if (y > 650) {
    doc.addPage();
    y = margins.top;
  }

  if (isCreative) {
    y = addCreativeSection(doc, 'PROJECTS', y, config, margins, pageWidth);
  } else if (isMinimal) {
    y = addMinimalSection(doc, 'Projects', y, config, margins, pageWidth);
  } else {
    y = addSection(doc, 'PROJECTS', y, config, margins, pageWidth);
  }

  studentProfile.projects.forEach((project) => {
    if (y > 700) {
      doc.addPage();
      y = margins.top;
    }

    doc
      .font(config.fonts.subheading)
      .fontSize(config.sizes.body)
      .fillColor(config.colors.text)
      .text(project.name || 'Project', margins.left, y);

    y = doc.y + 5;

    if (project.description) {
      doc
        .font(config.fonts.body)
        .fontSize(config.sizes.body)
        .fillColor(config.colors.text)
        .text(project.description, margins.left, y, { width: pageWidth, lineGap: 1 });

      y = doc.y + 5;
    }

    if (project.technologies && project.technologies.length > 0) {
      doc
        .font(config.fonts.emphasis)
        .fontSize(config.sizes.small)
        .fillColor(config.colors.light)
        .text(`Technologies: ${project.technologies.join(', ')}`, margins.left, y, { width: pageWidth });

      y = doc.y + config.spacing.itemGap;
    }
  });

  return y;
}

function addFooter(doc, config) {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .font(config.fonts.body)
      .fontSize(8)
      .fillColor(config.colors.light)
      .text(
        `Generated with InternshipConnect`,
        config.layout.margins.left,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - config.layout.margins.left - config.layout.margins.right }
      );
  }
}

/**
 * Delete PDF file
 * @param {String} filePath - Path to PDF file
 */
export const deletePDF = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted PDF: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting PDF:', error);
  }
};
