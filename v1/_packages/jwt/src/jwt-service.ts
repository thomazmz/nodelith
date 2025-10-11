
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { InternalServerError } from '@nodelith/http'
import { ValueObject } from '@nodelith/context'
import { Utilities } from '@nodelith/utilities'
import { JwtConfig } from './jwt-config'
import { JwtClaims } from './jwt-claims'

export class JwtService {
  public constructor(private readonly jwtConfig: JwtConfig) { }

  public async extractTokenClaims(encodedToken: string): Promise<JwtClaims> {
    const tokenBody = encodedToken.split('.')[1] ?? ''

    if(!tokenBody) {
      throw new Error('Invalid JWT token.')
    }

    const rawPayload = JSON.parse(Buffer.from(tokenBody, 'base64').toString())

    return this.convertJwtClaims(rawPayload)
  }

  public async verifyToken(encodedToken: string): Promise<JwtClaims> {
    return new Promise((resolve, rejects) => {
      const verifyOptions = {
        algorithms: [this.jwtConfig.algorithm],
      }

      jwt.verify(encodedToken, this.jwtConfig.publicKey, verifyOptions, (error: VerifyErrors, payload: JwtPayload) => {
        if (error) {
          rejects(error)
        } else {
          resolve(this.convertJwtClaims(payload))
        }
      })
    })
  }

  public async createAccessToken(clientKey: string, subjectKey: string, principalType: string): Promise<string> {
    const lifespan = this.jwtConfig.accessTokenLifespan
    const initializedPayload = this.initializeJwtPayload(clientKey, subjectKey, principalType, lifespan)
    return this.signJwt(initializedPayload)
  }

  public async createRefreshToken(clientKey: string, subjectKey: string, principalType: string): Promise<string> {
    const lifespan = this.jwtConfig.refreshTokenLifespan
    const initializedPayload = this.initializeJwtPayload(clientKey, subjectKey, principalType, lifespan)
    return this.signJwt(initializedPayload)
  }

  private async signJwt(jwtPayload: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        jwtPayload,
        this.jwtConfig.privateKey,
        {
          algorithm: this.jwtConfig.algorithm,
          keyid: this.jwtConfig.keyId,
        },
        (error: Error, token: string) => {
          if (error) {
            reject(error)
          } else {
            resolve(token)
          }
        },
      )
    })
  }

  private initializeJwtPayload(clt: string, sub: string, gty: string, lifespan: number) {
    const [iat, eat] = Utilities.Time.offset(lifespan)

    return {
      jti: Utilities.Uuid.create(),
      iss: this.jwtConfig.issuer,
      aud: [this.jwtConfig.audience],
      clt,
      sub,
      iat,
      eat,
      gty,
    }
  }

  private convertJwtClaims(rawPayload: ValueObject): JwtClaims {
    if (!rawPayload.aud || !Array.isArray(rawPayload.aud)) {
      throw new InternalServerError('invalid aud claim')
    } else if (!rawPayload.jti || typeof rawPayload.jti !== 'string') {
      throw new InternalServerError('missing jti claim')
    } else if (!rawPayload.iss || typeof rawPayload.iss !== 'string') {
      throw new InternalServerError('missing iss claim')
    } else if (!rawPayload.sub || typeof rawPayload.sub !== 'string') {
      throw new InternalServerError('missing sub claim')
    } else if (!rawPayload.gty || typeof rawPayload.gty !== 'string') {
      throw new InternalServerError('missing gty claim')
    } else if (!rawPayload.clt || typeof rawPayload.clt !== 'string') {
      throw new InternalServerError('missing clt claim')
    } else if (!rawPayload.iat || typeof rawPayload.iat !== 'number') {
      throw new InternalServerError('missing iat claim')
    } else if (!rawPayload.eat || typeof rawPayload.eat !== 'number') {
      throw new InternalServerError('missing eat claim')
    } else {
      return {
        aud: rawPayload.aud as string[],
        jti: rawPayload.jti,
        iss: rawPayload.iss,
        gty: rawPayload.gty,
        sub: rawPayload.sub,
        iat: rawPayload.iat,
        eat: rawPayload.eat,
        clt: rawPayload.clt,
      }
    }
  }
}
