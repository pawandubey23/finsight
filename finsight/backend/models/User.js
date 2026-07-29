const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    monthlyIncome: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
