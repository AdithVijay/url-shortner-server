const mongoose = require('mongoose');

// Schema for tracking clicks by date
const clickByDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
});

// Schema for tracking unique users by IP for each OS or device
const uniqueUserIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// Schema for tracking OS type analytics
const osTypeSchema = new mongoose.Schema({
  osName: {
    type: String,
    required: true,
  },
  uniqueClicks: {
    type: Number,
    default: 0,
  },
  uniqueUsers: {
    type: Number,
    default: 0,
  },
  uniqueUserIPs: [uniqueUserIPSchema], // Track unique users by IP for this OS
});

// Schema for tracking device type analytics
const deviceTypeSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
  },
  uniqueClicks: {
    type: Number,
    default: 0,
  },
  uniqueUsers: {
    type: Number,
    default: 0,
  },
  uniqueUserIPs: [uniqueUserIPSchema], // Track unique users by IP for this device type
});

// Main CustomAlias schema
const customAliasSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness for each alias
  },
  longUrl: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  uniqueUsers: {
    type: Number,
    default: 0,
  },
  clicksByDate: [clickByDateSchema], // Track clicks by date
  osType: [osTypeSchema], // Track OS-specific analytics
  deviceType: [deviceTypeSchema], // Track device-specific analytics
  uniqueUserClicks: [uniqueUserIPSchema], // Track overall unique users by IP
});

// Create and export the model
const CustomAlias = mongoose.model('CustomAlias', customAliasSchema);

module.exports = CustomAlias;
