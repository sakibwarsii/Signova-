export interface CharacterInfo {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
  description: string;
}

export const CHARACTER_PROFILES: Record<string, CharacterInfo> = {
  luna: {
    id: 'luna',
    name: 'Mentor Luna',
    role: 'AI Sign Language Guide 🇮🇳',
    badge: 'Indian Avatar',
    avatar: '👩‍🎓',
    description: 'Specialized in Indian Sign Language (ISL), traditional emerald green silk saree, and adaptive visual learning.'
  },
  anna: {
    id: 'anna',
    name: 'Instructor Anna',
    role: 'Sign Language Educator',
    badge: 'Classroom Teacher',
    avatar: '👩‍🏫',
    description: 'Specialized in structured classroom lectures and primary education signing.'
  },
  marc: {
    id: 'marc',
    name: 'Professor Marc',
    role: 'Senior Sign Educator',
    badge: 'Lead Faculty',
    avatar: '👨‍🏫',
    description: 'Academic lectures, science terminology, and advanced concept explanations.'
  },
  siggi: {
    id: 'siggi',
    name: 'Coach Siggi',
    role: 'Visual Learning Mentor',
    badge: 'Student Coach',
    avatar: '👨‍💻',
    description: 'Casual, approachable signing pace ideal for concept discovery and labs.'
  }
};

export function getCharacterProfile(avatarId: string): CharacterInfo {
  const cleanId = (avatarId || 'luna').toLowerCase().trim();
  if (cleanId === 'prachi' || cleanId === 'soumya' || cleanId === 'francoise') {
    return CHARACTER_PROFILES.luna;
  }
  return CHARACTER_PROFILES[cleanId] || CHARACTER_PROFILES.luna;
}

