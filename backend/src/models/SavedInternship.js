import mongoose from 'mongoose';

const savedInternshipSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

savedInternshipSchema.index({ student: 1, internship: 1 }, { unique: true });

export default mongoose.model('SavedInternship', savedInternshipSchema);
