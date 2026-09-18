// backend/src/models/University.js
import mongoose from 'mongoose';

/**
 * University / Institution profile.
 *
 * Represents a school's career-services or SIWES coordinator account.
 * Students affiliate with a university by selecting it from the directory
 * or entering the university's join code — no institutional email required
 * (deliberately simpler than the .edu-gated model, which does not fit the
 * Nigerian context this launches in).
 */
const universitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },

    // Short, shareable code students can use to join this university.
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    contact: {
      coordinatorName: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },

    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Nigeria' },
    },

    website: { type: String, trim: true },

    logo: {
      url: String,
      publicId: String,
    },

    // Set true once an admin confirms the institution is genuine.
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

universitySchema.index({ name: 1 });

/**
 * Generate a readable, collision-resistant join code, e.g. "UNILAG-7K3Q".
 */
universitySchema.statics.generateJoinCode = async function (name = '') {
  const base = (name.match(/\b[A-Za-z]/g) || ['U'])
    .join('')
    .toUpperCase()
    .slice(0, 6) || 'UNI';
  // Try a few times to avoid the rare collision.
  for (let i = 0; i < 6; i++) {
    const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const code = `${base}-${suffix}`;
    const exists = await this.exists({ joinCode: code });
    if (!exists) return code;
  }
  return `${base}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
};

const University = mongoose.model('University', universitySchema);
export default University;
