/** Shared application types for normalized Strapi content. */
export type SiteMode = 'india' | 'global'

export interface Service {
  title: string
  description: string
  slug: string
  tag: string
  shortDescription?: string
  fullContent?: ArticleContentBlock[]
  mode?: SiteMode
  updatedAt?: string
  seo?: unknown
}

export interface Industry {
  title: string
  description: string
  slug: string
  shortDescription?: string
  fullContent?: ArticleContentBlock[]
  mode?: SiteMode
  updatedAt?: string
  seo?: unknown
}

export interface Media {
  url: string
  alt?: string
  width?: number
  height?: number
  caption?: string
}

export interface ArticleContentBlock {
  type: string
  level?: number
  format?: string
  children?: Array<{ type?: string; text?: string }>
}

export interface Article {
  title: string
  excerpt: string
  category: string
  date: string
  slug: string
  image?: string | Media
  content?: ArticleContentBlock[]
  author?: string
  contentType?: string
  featured?: boolean
  mode?: SiteMode
  updatedAt?: string
  seo?: unknown
}

export interface Office {
  city: string
  country: string
  detail: string
}

export interface Job {
  title: string
  location: string
  type: string
  slug: string
}
