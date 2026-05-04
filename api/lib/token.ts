interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

/** Exchange an auth code for tokens (first-time login) */
export const exchangeCodeForTokens = async (
  code: string,
): Promise<StoredTokens> => {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data: TokenResponse = await res.json();

  if (!data.refresh_token) {
    throw new Error(
      "No refresh_token returned — revoke app access in Google account and try again",
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
};

/** Use a refresh token to get a new access token */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<StoredTokens> => {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data: TokenResponse = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // refresh tokens don't rotate unless revoked
    expiresAt: Date.now() + data.expires_in * 1000,
  };
};

/** Parse tokens from cookie string */
export const parseTokenCookie = (
  cookieStr: string | undefined,
): StoredTokens | null => {
  if (!cookieStr) return null;
  try {
    return JSON.parse(atob(cookieStr));
  } catch {
    return null;
  }
};

export const serializeTokenCookie = (tokens: StoredTokens): string =>
  btoa(JSON.stringify(tokens));

/** Get a valid access token, refreshing if needed */
export const getValidAccessToken = async (
  tokens: StoredTokens,
): Promise<StoredTokens> => {
  const isExpired = Date.now() >= tokens.expiresAt - 60_000; // 1 min buffer
  if (!isExpired) return tokens;
  return refreshAccessToken(tokens.refreshToken);
};
