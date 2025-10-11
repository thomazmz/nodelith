import { MerchantApiModule } from './module'

(async () => {
  await MerchantApiModule.initialize()
  const application = MerchantApiModule.resolveApplication()
  application.listen(3001, () => {
    console.log('Merchant API listening on port 3001')
  })
})()
