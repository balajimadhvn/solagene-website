/** Estimated reading time at about 220 words per minute. Kept apart from articles.ts so importing it does not pull in the article bodies. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 220));
