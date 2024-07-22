// FROM: https://github.com/middyjs/middy/blob/main/packages/http-header-normalizer/index.js
import type { WithHeaders, WithNormalizedHeaders, WithPossibleHeaders, WithPossibleOutputHeaders } from './types';

const EXCEPTIONS_LIST = [
  'ALPN',
  'C-PEP',
  'C-PEP-Info',
  'CalDAV-Timezones',
  'Content-ID',
  'Content-MD5',
  'DASL',
  'DAV',
  'DNT',
  'ETag',
  'GetProfile',
  'HTTP2-Settings',
  'Last-Event-ID',
  'MIME-Version',
  'Optional-WWW-Authenticate',
  'Sec-WebSocket-Accept',
  'Sec-WebSocket-Extensions',
  'Sec-WebSocket-Key',
  'Sec-WebSocket-Protocol',
  'Sec-WebSocket-Version',
  'SLUG',
  'TCN',
  'TE',
  'TTL',
  'WWW-Authenticate',
  'X-ATT-DeviceId',
  'X-DNSPrefetch-Control',
  'X-UIDH',
  'X-XSS-Protection',
];

export function isWithHeaders(x: unknown): x is WithHeaders {
  return !!(x && typeof x === 'object' && 'headers' in x && typeof x.headers === 'object');
}

export function fromExceptionList(s: string): string | undefined {
  const ss = s.toLowerCase();
  return EXCEPTIONS_LIST.find((i) => i.toLowerCase() === ss);
}

// --------------------------------------------------------------------------
export function lowerCaseNormalizer(s: string): string {
  return s.toLowerCase();
}

export function canonicalNormalizer(s: string): string {
  const exception = fromExceptionList(s);
  return (
    exception ??
    s
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase())
      .join('-')
  );
}

export function normalizeKeys(
  rec: Record<string, string | undefined> | undefined,
  normalizer: (s: string) => string
): Record<string, string> {
  return rec
    ? Object.keys(rec).reduce(
        (acc, key) => ({
          ...acc,
          [normalizer(key)]: rec[key],
        }),
        {}
      )
    : {};
}

// --------------------------------------------------------------------------
export const transformInput =
  <I extends WithPossibleHeaders>(normalizeRequestHeaders: boolean) =>
  (i: I): I & WithNormalizedHeaders => ({
    ...i,
    normalizedHeaders: normalizeRequestHeaders ? normalizeKeys(i.headers, lowerCaseNormalizer) : { ...i.headers },
  });

export const transformOutput =
  (normalizeResponseHeaders: boolean) =>
  <WO>(wo: WO): WO & WithPossibleOutputHeaders =>
    Object.assign(
      {},
      wo,
      normalizeResponseHeaders && isWithHeaders(wo)
        ? { headers: normalizeKeys(wo.headers, canonicalNormalizer) }
        : isWithHeaders(wo)
          ? { headers: { ...wo.headers } }
          : {}
    );
