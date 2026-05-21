import express, { type Application, type Request, type Response } from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";


const app: Application = express()

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send({
        server: "Dev_Pulse",
        description: "Internal Tech Issue & Feature Tracker, A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions."
    })
})

app.use("/api/auth", authRoute) 
app.use("/api/issues", issuesRoute) 


export default app;