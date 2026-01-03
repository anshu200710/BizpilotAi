import {
  MapPin,
  Clock,
  MessageCircle,
  Briefcase,
  Package,
  Sparkles,
  Trash2
} from 'lucide-react'
import Button from './Button'

export default function BusinessProfilePreview({ profile, onDelete }) {
  if (!profile.businessName) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center text-gray-400">
        <p className="text-sm">
          Business profile preview will appear here
        </p>
        <p className="text-xs mt-1">
          Use AI or fill the form to see live preview
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {profile.businessName}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Live AI Preview
          </p>
        </div>
      </div>

      {/* Description */}
      {profile.description && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {profile.description}
        </p>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info
          icon={<MapPin className="w-4 h-4" />}
          label="Location"
          value={profile.location}
        />
        <Info
          icon={<Clock className="w-4 h-4" />}
          label="Working Hours"
          value={profile.workingHours}
        />
        <Info
          icon={<MessageCircle className="w-4 h-4" />}
          label="Chatbot Tone"
          value={profile.tone}
        />
      </div>

      {/* Services */}
      <TagList
        icon={<Briefcase className="w-4 h-4" />}
        label="Services"
        items={profile.services}
        color="blue"
      />

      {/* Products */}
      <TagList
        icon={<Package className="w-4 h-4" />}
        label="Products"
        items={profile.products}
        color="green"
      />

      {/* Extra Instructions */}
      {profile.extraInstructions && (
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-sm font-medium mb-1">
            🤖 Chatbot Instructions
          </p>
          <p className="text-sm text-gray-600">
            {profile.extraInstructions}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="danger" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Profile
        </Button>
      </div>
    </div>
  )
}

function Info({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-700 font-medium">{value}</p>
      </div>
    </div>
  )
}

function TagList({ icon, label, items, color = 'gray' }) {
  if (!items) return null

  const list = items.split(',').map(i => i.trim()).filter(Boolean)
  if (!list.length) return null

  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-gray-400">{icon}</div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((item, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-1 rounded-full ${colors[color]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
