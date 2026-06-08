import mongoose from 'mongoose';

const referralCodeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ReferralCode', referralCodeSchema);
