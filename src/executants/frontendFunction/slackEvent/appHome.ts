import { invokeBackend } from "../invokeBackend"

const appHome = {
  create: async ({ event }) => {
    const payload = { userId: event.user, data: {} }
    await invokeBackend("createAppHome", payload)
  }
};
export default appHome