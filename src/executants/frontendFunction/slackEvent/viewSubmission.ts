import { invokeBackend } from "../invokeBackend"

const viewHandler = {
  async handleViewSubmission({ ack, body, view, context }) {
    await invokeBackend("handleViewSubmission", { ack, body, view, context })
  }
};
export default viewHandler