import { CustomerApiModule } from './module'

(async () => {
  await CustomerApiModule.initialize()
  const application = CustomerApiModule.resolveApplication()
  application.listen(3002, () => {
    console.log('Customer API listening on port 3002')
  })
})()
