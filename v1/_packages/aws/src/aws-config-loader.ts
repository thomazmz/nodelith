import { ConfigLoader } from '@nodelith/config'
import { SSM } from '@aws-sdk/client-ssm'
import * as path from 'path';

export class AwsConfigLoader implements ConfigLoader {
  private ssmPath?: string
  private ssmClient?: SSM

  constructor() {
    const path = process.env.AWS_ENV_PATH ?? ''
    const region = process.env.AWS_DEFAULT_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (path && region && accessKeyId && secretAccessKey) {
      this.ssmClient = new SSM({ region, credentials: { accessKeyId, secretAccessKey } })
      this.ssmPath = path
    }
  }

  async load(key: string): Promise<string | undefined> {
    if (process.env[key]) {
      return process.env[key]
    }

    if (!this.ssmPath || !this.ssmClient) {
      return undefined
    }

    const { Parameters: [Parameter] = [] } = await this.ssmClient.getParameters({
      Names: [path.join(this.ssmPath, key)],
      WithDecryption: true,
    })

    return Parameter?.Value
  }
}
