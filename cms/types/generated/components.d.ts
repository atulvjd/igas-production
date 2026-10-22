import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCarousel extends Struct.ComponentSchema {
  collectionName: 'components_shared_carousels';
  info: {
    displayName: 'Carousel';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    slides: Schema.Attribute.Component<'shared.carousel-slide', true>;
    title: Schema.Attribute.String;
  };
}

export interface SharedCarouselSlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_carousel_slides';
  info: {
    displayName: 'Carousel slide';
  };
  attributes: {
    category: Schema.Attribute.String;
    date: Schema.Attribute.String;
    excerpt: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Component<'shared.media', false>;
    imageAlt: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCollectionListing extends Struct.ComponentSchema {
  collectionName: 'components_shared_collection_listings';
  info: {
    displayName: 'Collection listing';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    intro: Schema.Attribute.Text;
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    source: Schema.Attribute.Enumeration<
      ['services', 'industries', 'articles', 'jobs', 'offices', 'leadership']
    > &
      Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SharedContactForm extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_forms';
  info: {
    displayName: 'Contact form';
  };
  attributes: {
    consentText: Schema.Attribute.String;
    contactEmail: Schema.Attribute.Email;
    contactPhone: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    successMessage: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedCookieConsent extends Struct.ComponentSchema {
  collectionName: 'components_shared_cookie_consents';
  info: {
    displayName: 'Cookie consent content';
  };
  attributes: {
    acceptLabel: Schema.Attribute.String;
    analyticsLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    essentialLabel: Schema.Attribute.String;
    manageLabel: Schema.Attribute.String;
    marketingLabel: Schema.Attribute.String;
    privacyHref: Schema.Attribute.String;
    privacyLabel: Schema.Attribute.String;
    rejectLabel: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_ctas';
  info: {
    displayName: 'Call to action';
  };
  attributes: {
    body: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['light', 'dark', 'accent']> &
      Schema.Attribute.DefaultTo<'dark'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    displayName: 'Footer column';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.footer-link', true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_links';
  info: {
    displayName: 'Footer link';
  };
  attributes: {
    external: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Component<'shared.media', false>;
    imageUrl: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    videoUrl: Schema.Attribute.String;
  };
}

export interface SharedImageText extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_texts';
  info: {
    displayName: 'Image and text';
  };
  attributes: {
    body: Schema.Attribute.Text;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Component<'shared.media', false>;
    imageAlt: Schema.Attribute.String;
    imageSide: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    imageUrl: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.Text;
    file: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedMegaMenu extends Struct.ComponentSchema {
  collectionName: 'components_shared_mega_menus';
  info: {
    displayName: 'Mega menu content';
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    section: Schema.Attribute.Enumeration<
      [
        'what-we-do',
        'where-we-focus',
        'who-we-are',
        'latest-thinking',
        'careers',
      ]
    > &
      Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote / banner';
  };
  attributes: {
    author: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    signature: Schema.Attribute.Text;
  };
}

export interface SharedQuoteBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_quote_banners';
  info: {
    displayName: 'Quote banner';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.quote-item', true>;
  };
}

export interface SharedQuoteItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_quote_items';
  info: {
    displayName: 'Quote item';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    author: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    source: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    displayName: 'Rich text';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    eyebrow: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['light', 'dark', 'accent']> &
      Schema.Attribute.DefaultTo<'light'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    twitterImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    displayName: 'Stat item';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    detail: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStats extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stats';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'shared.stat-item', true>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.carousel': SharedCarousel;
      'shared.carousel-slide': SharedCarouselSlide;
      'shared.collection-listing': SharedCollectionListing;
      'shared.contact-form': SharedContactForm;
      'shared.cookie-consent': SharedCookieConsent;
      'shared.cta': SharedCta;
      'shared.footer-column': SharedFooterColumn;
      'shared.footer-link': SharedFooterLink;
      'shared.hero': SharedHero;
      'shared.image-text': SharedImageText;
      'shared.media': SharedMedia;
      'shared.mega-menu': SharedMegaMenu;
      'shared.quote': SharedQuote;
      'shared.quote-banner': SharedQuoteBanner;
      'shared.quote-item': SharedQuoteItem;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
      'shared.stat-item': SharedStatItem;
      'shared.stats': SharedStats;
    }
  }
}
