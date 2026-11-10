const app = require("./app");
const { connectDB, closeDB } =
    require("./config/database");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(
                `Dynamo API running at http://localhost:${PORT}`
            );
        });

        async function shutdown() {
            server.close(async () => {
                await closeDB();
                process.exit(0);
            });
        }

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error) {
        console.error(
            "Failed to start Dynamo backend:",
            error
        );
        process.exit(1);
    }
}

startServer();