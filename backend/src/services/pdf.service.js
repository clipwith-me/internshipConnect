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
 * Features:
 * - Microsoft-inspired design
 * - Professional formatting
 * - Support for images (profile picture)
 * - Multi-section layout
 * - Downloadable output
 */

/**
 * Generate Resume PDF
 * @param {Object} studentProfile - Student profile data
 * @param {Object} resumeContent - AI-generated content
 * @param {String} fileName - Output file name
 * @returns {Promise<String>} - Path to generated PDF
 */
export const generateResumePDF = async (studentProfile, resumeContent, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const outputPath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // ═══════════════════════════════════════════════════════════
      // HEADER SECTION
      // ═══════════════════════════════════════════════════════════

      const { personalInfo } = studentProfile;
      const primaryColor = '#0078D4'; // Microsoft Blue
      const textColor = '#1F1F1F';
      const lightGray = '#666666';

      // Name (Large, Bold)
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor(textColor)
        .text(
          `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim().toUpperCase(),
          50,
          50
        );

      // Professional Title / Target Role
      if (resumeContent?.targetRole) {
        doc
          .font('Helvetica')
          .fontSize(14)
          .fillColor(primaryColor)
          .text(resumeContent.targetRole, 50, 85);
      }

      // Contact Information (Line)
      let contactY = 110;
      const contactInfo = [];

      if (personalInfo?.email) contactInfo.push(personalInfo.email);
      if (personalInfo?.phone) contactInfo.push(personalInfo.phone);
      if (personalInfo?.location?.city && personalInfo?.location?.country) {
        contactInfo.push(`${personalInfo.location.city}, ${personalInfo.location.country}`);
      }

      if (contactInfo.length > 0) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(lightGray)
          .text(contactInfo.join('  •  '), 50, contactY);
      }

      // Horizontal line separator
      const lineY = contactY + 25;
      doc
        .strokeColor(primaryColor)
        .lineWidth(2)
        .moveTo(50, lineY)
        .lineTo(545, lineY)
        .stroke();

      let currentY = lineY + 30;

      // ═══════════════════════════════════════════════════════════
      // PROFESSIONAL SUMMARY
      // ═══════════════════════════════════════════════════════════

      if (resumeContent?.summary || personalInfo?.bio) {
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('PROFESSIONAL SUMMARY', 50, currentY);

        currentY += 20;

        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(textColor)
          .text(resumeContent?.summary || personalInfo?.bio, 50, currentY, {
            width: 495,
            align: 'justify'
          });

        currentY = doc.y + 25;
      }

      // ═══════════════════════════════════════════════════════════
      // EDUCATION
      // ═══════════════════════════════════════════════════════════

      if (studentProfile.education && studentProfile.education.length > 0) {
        // Check if we need a new page
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('EDUCATION', 50, currentY);

        currentY += 20;

        studentProfile.education.forEach((edu, index) => {
          // Check page overflow
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          // Institution & Degree
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(textColor)
            .text(edu.institution || 'Institution', 50, currentY);

          currentY = doc.y + 2;

          doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor(textColor)
            .text(`${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'}`, 50, currentY);

          currentY = doc.y + 2;

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
              .font('Helvetica')
              .fontSize(10)
              .fillColor(lightGray)
              .text(eduDetails.join('  •  '), 50, currentY);

            currentY = doc.y + 15;
          } else {
            currentY += 15;
          }
        });

        currentY += 10;
      }

      // ═══════════════════════════════════════════════════════════
      // SKILLS
      // ═══════════════════════════════════════════════════════════

      if (studentProfile.skills && studentProfile.skills.length > 0) {
        // Check if we need a new page
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('SKILLS', 50, currentY);

        currentY += 20;

        // Group skills by category
        const skillsByCategory = studentProfile.skills.reduce((acc, skill) => {
          const category = skill.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill.name);
          return acc;
        }, {});

        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor(textColor)
            .text(`${category}:`, 50, currentY, { continued: true })
            .font('Helvetica')
            .fillColor(textColor)
            .text(` ${skills.join(', ')}`, { width: 495 });

          currentY = doc.y + 12;
        });

        currentY += 10;
      }

      // ═══════════════════════════════════════════════════════════
      // EXPERIENCE
      // ═══════════════════════════════════════════════════════════

      if (studentProfile.experience && studentProfile.experience.length > 0) {
        // Check if we need a new page
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('EXPERIENCE', 50, currentY);

        currentY += 20;

        studentProfile.experience.forEach((exp) => {
          // Check page overflow
          if (currentY > 650) {
            doc.addPage();
            currentY = 50;
          }

          // Job Title
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(textColor)
            .text(exp.title || 'Position', 50, currentY);

          currentY = doc.y + 2;

          // Company
          doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor(textColor)
            .text(exp.company || 'Company', 50, currentY);

          currentY = doc.y + 2;

          // Dates
          if (exp.startDate || exp.endDate) {
            const startDate = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
            const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor(lightGray)
              .text(`${startDate} - ${endDate}`, 50, currentY);

            currentY = doc.y + 10;
          }

          // Description / Achievements
          if (exp.description) {
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor(textColor)
              .text(exp.description, 50, currentY, {
                width: 495,
                align: 'justify'
              });

            currentY = doc.y + 5;
          }

          // Achievements (bullet points)
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((achievement) => {
              if (currentY > 720) {
                doc.addPage();
                currentY = 50;
              }

              doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor(textColor)
                .text('•', 60, currentY, { continued: true })
                .text(` ${achievement}`, { width: 485 });

              currentY = doc.y + 5;
            });
          }

          currentY += 15;
        });
      }

      // ═══════════════════════════════════════════════════════════
      // PROJECTS (if available)
      // ═══════════════════════════════════════════════════════════

      if (studentProfile.projects && studentProfile.projects.length > 0) {
        // Check if we need a new page
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('PROJECTS', 50, currentY);

        currentY += 20;

        studentProfile.projects.forEach((project) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor(textColor)
            .text(project.name || 'Project', 50, currentY);

          currentY = doc.y + 5;

          if (project.description) {
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor(textColor)
              .text(project.description, 50, currentY, { width: 495 });

            currentY = doc.y + 5;
          }

          if (project.technologies && project.technologies.length > 0) {
            doc
              .font('Helvetica-Bold')
              .fontSize(9)
              .fillColor(lightGray)
              .text('Technologies:', 50, currentY, { continued: true })
              .font('Helvetica')
              .text(` ${project.technologies.join(', ')}`, { width: 495 });

            currentY = doc.y + 12;
          }

          currentY += 5;
        });
      }

      // ═══════════════════════════════════════════════════════════
      // FOOTER (Optional - Generated with InternshipConnect)
      // ═══════════════════════════════════════════════════════════

      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(lightGray)
          .text(
            `Generated with InternshipConnect`,
            50,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 100 }
          );
      }

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
