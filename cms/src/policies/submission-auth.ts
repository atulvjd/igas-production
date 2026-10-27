import { timingSafeEqual } from 'node:crypto';

// This credential can only submit: no Content API read routes exist for the inboxes.
export default (ctx: { request: { headers: Record<string, string | undefined> } }) => {
  const secret = process.env.STRAPI_SUBMISSIONS_SECRET?.trim();
  const supplied = ctx.request.headers.authorization;
  if (!secret || secret.length < 32 || !supplied?.startsWith('Bearer ')) return false;
  const actual = Buffer.from(supplied.slice(7));
  const expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
