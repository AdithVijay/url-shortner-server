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

// Main URL schema
const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  longUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
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
const URL = mongoose.model('URL', urlSchema);

module.exports = URL;
