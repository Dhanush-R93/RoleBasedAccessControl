import { app } from "@/server/server"; 

const handle = (req: Request) => app.handle(req);

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };