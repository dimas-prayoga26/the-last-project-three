/** Shapes returned by the Laravel API (/api/v1). Translatable fields arrive in the requested locale. */

export type Discipline = 'architecture' | 'interior' | 'design'

export type SocialPlatform =
  | 'instagram'
  | 'linkedin'
  | 'behance'
  | 'pinterest'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'website'

export interface Media {
  id: number
  /** Large web version (max 2000 px). */
  url: string
  original: string
  /** 4:5 crop for cards (covers and designer photos only). */
  card: string | null
  /** Small version (max 640 px). */
  thumb: string | null
  width: number | null
  height: number | null
  alt: string | null
}

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

export interface Category {
  id: number
  discipline: Discipline
  name: string
  slug: string
  preview?: Media | null
}

export interface NavigationDiscipline {
  key: Discipline
  categories: Category[]
}

export interface DesignerCredit {
  name: string
  slug: string
}

export interface DesignerSummary {
  id: number
  name: string
  slug: string
  title: string | null
  location: string | null
  photo: Media | null
  socials: SocialLink[]
  projects_count?: number
}

export interface ProjectSummary {
  id: number
  slug: string
  title: string
  summary: string | null
  year: number | null
  location: string | null
  is_featured: boolean
  discipline: Discipline
  category: Category
  cover: Media | null
  designers: DesignerCredit[]
}

export interface Designer extends DesignerSummary {
  email: string | null
  bio: string | null
  /** One-line introduction under the name. */
  headline: string | null
  /** A longer quote about their way of working. */
  statement: string | null
  /** Distinct disciplines of their published works. */
  disciplines: Discipline[]
  projects: ProjectSummary[]
}

/** The work an image in a designer's gallery belongs to. */
export interface GalleryWork {
  id: number
  slug: string
  title: string
  year: number | null
  discipline: Discipline
  category: Category
}

/** An image from /designers/{slug}/gallery: every image of the designer's works, cover first per work. */
export type GalleryImage = Media & { work: GalleryWork }

export interface Project extends Omit<ProjectSummary, 'designers'> {
  description: string | null
  client: string | null
  area: string | null
  photographer: string | null
  published_at: string | null
  designers: DesignerSummary[]
  gallery: Media[]
}

export interface ProjectResponse {
  data: Project
  previous: ProjectSummary | null
  next: ProjectSummary | null
  related: ProjectSummary[]
}

export interface PressItem {
  id: number
  title: string
  publication: string
  published_on: string
  url: string | null
  excerpt: string | null
  image: Media | null
  document_url: string | null
}

export interface Studio {
  intro: string | null
  about: {
    heading: string | null
    body: string | null
    image: Media | null
  }
  contact: {
    email: string | null
    phone: string | null
    whatsapp: string | null
    address: string | null
    map_url: string | null
    office_hours: string | null
  }
  socials: SocialLink[]
}

export type EventType = 'talk' | 'workshop' | 'exhibition' | 'meetup'

/** A talk, workshop, exhibition or meetup of the collective (/events). */
export interface CommunityEvent {
  id: number
  slug: string
  title: string
  type: EventType
  summary: string | null
  description: string | null
  /** ISO 8601, wall-clock time in the API's timezone (UTC). */
  starts_at: string
  ends_at: string | null
  is_past: boolean
  venue: string | null
  city: string | null
  registration_url: string | null
  cover: Media | null
}

export interface Resource<T> {
  data: T
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ContactMessageInput {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  /** Honeypot, must stay empty. */
  website: string
}
