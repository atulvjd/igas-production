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
  text?: string
  level?: number
  format?: string
  url?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  image?: { url: string; alternativeText?: string; caption?: string; width?: number; height?: number }
  children?: ArticleContentBlock[]
}

export interface Article {
  title: string
  excerpt: string
  category: string
  date: string
  publicationDate?: string
  sortOrder?: number
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
