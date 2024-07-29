const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  data: Buffer,
  contentType: String,
});

const adminRegistrationSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{12}$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/,
  },
  address: {
    type: String,
    required: true,
  },
  bankAccountName: {
    type: String,
    required: true,
  },
  bankAccountNumber: {
    type: String,
    required: true,
    match: /^\d{8,18}$/,
  },
  bankName: {
    type: String,
    required: true,
  },
  bankBranch: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  },
  panCard: fileSchema,
  addressProof: fileSchema,
  profilePicture: fileSchema,
  referralCode: String,
  promotionalCode: String,
});

const AdminRegistration = mongoose.model(
  "AdminRegistration",
  adminRegistrationSchema
);

module.exports = AdminRegistration;
