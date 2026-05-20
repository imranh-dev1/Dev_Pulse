import express, { type Application, type Request, type Response } from "express";

const app: Application = express()

app.get('/', (req: Request, res: Response) => {
    res.send({
        server: "Dev_Pulse",
        description: "Internal Tech Issue & Feature Tracker, A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions."
    })
})


export default app;