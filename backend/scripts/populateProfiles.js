// Script to populate sample profile data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import StudentProfile from '../src/models/StudentProfile.js';
import OrganizationProfile from '../src/models/OrganizationProfile.js';

dotenv.config();

async function populateProfiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find();
    console.log(`\n📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email} (${user.role})`);

      if (user.role === 'student') {
        // Check if profile exists
        let profile = await StudentProfile.findOne({ user: user._id });

        if (!profile) {
          console.log('  Creating new student profile...');
          profile = new StudentProfile({
            user: user._id,
            personalInfo: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '+1234567890',
              dateOfBirth: new Date('2000-01-01'),
              location: {
                city: 'New York',
                state: 'NY',
                country: 'USA',
                coordinates: { type: 'Point', coordinates: [-74.006, 40.7128] }
              }
            },
            education: [
              {
                institution: 'University of Technology',
                degree: 'bachelor',
                major: 'Computer Science',
                graduationYear: 2024,
                gpa: 3.8,
                achievements: ['Dean\'s List', 'Hackathon Winner 2023'],
                startDate: new Date('2020-09-01'),
                endDate: new Date('2024-05-30')
              }
            ],
            skills: [
              { name: 'JavaScript', category: 'technical', level: 'advanced' },
              { name: 'React', category: 'framework', level: 'advanced' },
              { name: 'Node.js', category: 'framework', level: 'intermediate' },
              { name: 'MongoDB', category: 'tool', level: 'intermediate' },
              { name: 'Python', category: 'technical', level: 'intermediate' }
            ],
            experience: [
              {
                company: 'Tech Startup Inc.',
                title: 'Frontend Developer Intern',
                employmentType: 'internship',
                location: { city: 'San Francisco', country: 'USA', remote: false },
                startDate: new Date('2023-06-01'),
                endDate: new Date('2023-08-31'),
                current: false,
                description: 'Developed React components and improved user interface',
                achievements: ['Increased page load speed by 40%', 'Implemented new dashboard feature']
              }
            ],
            preferences: {
              internshipTypes: ['remote', 'hybrid'],
              industries: ['Technology', 'Software Development', 'Startups'],
              roles: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer'],
              locations: [
                { city: 'New York', country: 'USA', willingToRelocate: true },
                { city: 'San Francisco', country: 'USA', willingToRelocate: true }
              ],
              compensation: {
                minStipend: 50000,
                currency: 'USD'
              }
            }
          });
          await profile.save();
          console.log('  ✅ Student profile created');
        } else {
          // Update existing profile with sample data if fields are empty
          if (!profile.personalInfo?.firstName) {
            profile.personalInfo = {
              firstName: 'John',
              lastName: 'Doe',
              phone: '+1234567890',
              dateOfBirth: new Date('2000-01-01'),
              location: {
                city: 'New York',
                state: 'NY',
                country: 'USA',
                coordinates: { type: 'Point', coordinates: [-74.006, 40.7128] }
              }
            };
          }

          if (!profile.education || profile.education.length === 0) {
            profile.education = [
              {
                institution: 'University of Technology',
                degree: 'bachelor',
                major: 'Computer Science',
                graduationYear: 2024,
                gpa: 3.8,
                achievements: ['Dean\'s List', 'Hackathon Winner 2023'],
                startDate: new Date('2020-09-01'),
                endDate: new Date('2024-05-30')
              }
            ];
          }

          if (!profile.skills || profile.skills.length === 0) {
            profile.skills = [
              { name: 'JavaScript', category: 'technical', level: 'advanced' },
              { name: 'React', category: 'framework', level: 'advanced' },
              { name: 'Node.js', category: 'framework', level: 'intermediate' },
              { name: 'MongoDB', category: 'tool', level: 'intermediate' },
              { name: 'Python', category: 'technical', level: 'intermediate' }
            ];
          }

          if (!profile.experience || profile.experience.length === 0) {
            profile.experience = [
              {
                company: 'Tech Startup Inc.',
                title: 'Frontend Developer Intern',
                employmentType: 'internship',
                location: { city: 'San Francisco', country: 'USA', remote: false },
                startDate: new Date('2023-06-01'),
                endDate: new Date('2023-08-31'),
                current: false,
                description: 'Developed React components and improved user interface',
                achievements: ['Increased page load speed by 40%', 'Implemented new dashboard feature']
              }
            ];
          }

          await profile.save();
          console.log('  ✅ Student profile updated');
        }
      } else if (user.role === 'organization') {
        // Check if profile exists
        let profile = await OrganizationProfile.findOne({ user: user._id });

        if (!profile) {
          console.log('  Creating new organization profile...');
          profile = new OrganizationProfile({
            user: user._id,
            companyInfo: {
              name: `Tech Innovations Corp ${user.email}`,
              industry: 'technology',
              companySize: '201-500',
              founded: 2015,
              headquarters: {
                city: 'San Francisco',
                state: 'CA',
                country: 'USA'
              },
              website: 'https://techinnovations.example.com'
            },
            description: {
              short: 'Leading technology company specializing in innovative software solutions',
              full: 'Tech Innovations Corp is a cutting-edge technology company focused on developing innovative software solutions for businesses worldwide. We pride ourselves on fostering talent and providing exceptional internship opportunities for aspiring developers and engineers.'
            },
            contactInfo: {
              primaryEmail: user.email,
              phone: '+1-555-0100',
              hrEmail: 'hr@techinnovations.example.com'
            },
            statistics: {
              totalInternships: 25,
              activeInternships: 5,
              totalApplications: 450,
              totalHires: 18
            },
            verification: {
              status: 'verified',
              verifiedAt: new Date(),
              trustScore: 95
            }
          });
          await profile.save();
          console.log('  ✅ Organization profile created');
        } else {
          // Update existing profile with sample data if fields are empty
          if (!profile.companyInfo?.name) {
            profile.companyInfo = {
              name: `Tech Innovations Corp ${user.email}`,
              industry: 'technology',
              companySize: '201-500',
              founded: 2015,
              headquarters: {
                city: 'San Francisco',
                state: 'CA',
                country: 'USA'
              },
              website: 'https://techinnovations.example.com'
            };
          }

          if (!profile.description?.short) {
            profile.description = {
              short: 'Leading technology company specializing in innovative software solutions',
              full: 'Tech Innovations Corp is a cutting-edge technology company focused on developing innovative software solutions for businesses worldwide. We pride ourselves on fostering talent and providing exceptional internship opportunities for aspiring developers and engineers.'
            };
          }

          if (!profile.contactInfo?.primaryEmail) {
            profile.contactInfo = {
              primaryEmail: user.email,
              phone: '+1-555-0100',
              hrEmail: 'hr@techinnovations.example.com'
            };
          }

          if (!profile.statistics) {
            profile.statistics = {
              totalInternships: 25,
              activeInternships: 5,
              totalApplications: 450,
              totalHires: 18
            };
          }

          await profile.save();
          console.log('  ✅ Organization profile updated');
        }
      }
    }

    console.log('\n✅ All profiles populated successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

populateProfiles();