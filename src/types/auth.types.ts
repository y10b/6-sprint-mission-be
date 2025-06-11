export interface JwtPayload {
  id: number;
  email?: string;
  nickname?: string;
}

export interface TokenResponse {
  message: string;
  accessToken: string;
}
