import mongoose from 'mongoose'

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    businessName: String,
    description: String,

    services: [String],
    products: [String],

    location: String,
    workingHours: String,

    tone: {
      type: String,
      enum: ['professional', 'friendly', 'salesy'],
      default: 'friendly',
    },

    extraInstructions: String,
  },
  { timestamps: true }
)

export default mongoose.model('BusinessProfile', businessProfileSchema)
