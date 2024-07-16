export function performAction (action: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void | Promise<void>){
  return new Promise((resolve, reject) => {
    const maxRetries = 5

    let retries = 0

    const perform = async () => {
      try {
        await action(resolve, reject)
      } catch (error) {
        if (retries >= maxRetries) reject(error)
        else {
          retries++
          setTimeout(() => perform(), 500)
        }
      }
    }

    perform()
  })
}