export const Urls = {
  SWAGGER_DOCS: 'docs'
} as const;

export type UrlType = (typeof Urls)[keyof typeof Urls];
