import { Algorithm } from 'jsonwebtoken'

export type JwtConfig = {
  issuer: string
  audience: string
  keyId: string
  privateKey: string
  publicKey: string
  algorithm: Algorithm
  accessTokenLifespan: number
  refreshTokenLifespan: number
}
