import BusinessProfile from '../models/BusinessProfile.js'

export const getProfile = async (req, res) => {
  const userId = req.user.id

  const profile = await BusinessProfile.findOne({ user: userId })
  res.json(profile)
}

export const upsertProfile = async (req, res) => {
  const userId = req.user.id

  const profile = await BusinessProfile.findOneAndUpdate(
    { user: userId },
    { ...req.body, user: userId },
    { new: true, upsert: true }
  )

  res.json(profile)
}
