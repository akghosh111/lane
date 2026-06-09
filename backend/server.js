import { createServer } from "node:http";
import { createApplication } from "./src/app/index.js";


async function main() {
    try {
        const server = createServer(createApplication());
        const PORT = 3000

        server.listen(PORT, () => {
            console.log(`HTTP server is running on PORT ${PORT}`)
        })
    } catch (error) {
        console.log("Error starting http server");
        throw error
    }
}

main()