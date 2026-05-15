/**
 * Decode the payload from a JWT without verifying the signature.
 * We only need the groups claim that Okta puts in the access token,
 * and the token has already been validated by Okta's token endpoint.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const [, payloadBase64Url] = token.split(".");

    if (!payloadBase64Url) {
      return {};
    }

    const base64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}
