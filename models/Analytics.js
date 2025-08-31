const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String, required: true }
});

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in seconds
  isActive: { type: Boolean, default: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  country: { type: String },
  city: { type: String },
  referrer: { type: String },
  source: { type: String, enum: ['direct', 'facebook', 'instagram', 'linkedin', 'google', 'other'] },
  pageViews: [pageViewSchema],
  consentGiven: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for better query performance
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ source: 1 });
sessionSchema.index({ country: 1 });

// Method to end session and calculate duration
sessionSchema.methods.endSession = function() {
  this.endTime = new Date();
  this.isActive = false;
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  return this.save();
};

// Method to add page view
sessionSchema.methods.addPageView = function(url, title) {
  this.pageViews.push({ url, title, sessionId: this.sessionId });
  return this.save();
};

// Static method to get analytics summary
sessionSchema.statics.getAnalyticsSummary = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalPageViews: { $sum: { $size: '$pageViews' } },
        avgSessionDuration: { $avg: '$duration' },
        uniqueCountries: { $addToSet: '$country' },
        sources: { $addToSet: '$source' }
      }
    },
    {
      $project: {
        totalSessions: 1,
        totalPageViews: 1,
        avgSessionDuration: { $round: ['$avgSessionDuration', 2] },
        uniqueCountries: { $size: '$uniqueCountries' },
        sources: 1
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSessions: 0,
    totalPageViews: 0,
    avgSessionDuration: 0,
    uniqueCountries: 0,
    sources: []
  };
};

// Static method to get popular pages
sessionSchema.statics.getPopularPages = async function(startDate, endDate, limit = 10) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$pageViews' },
    {
      $group: {
        _id: {
          url: '$pageViews.url',
          title: '$pageViews.title'
        },
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: limit },
    {
      $project: {
        url: '$_id.url',
        title: '$_id.title',
        visits: 1
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get traffic sources
sessionSchema.statics.getTrafficSources = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$source',
        sessions: { $sum: 1 }
      }
    },
    { $sort: { sessions: -1 } }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get geographic data
sessionSchema.statics.getGeographicData = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$country',
        sessions: { $sum: 1 }
      }
    },
    { $sort: { sessions: -1 } }
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Analytics', sessionSchema);
