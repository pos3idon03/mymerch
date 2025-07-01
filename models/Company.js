const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  logo: { type: String },
  favicon: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  location: { type: String },
  telephone: { type: String },
  email: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema); 