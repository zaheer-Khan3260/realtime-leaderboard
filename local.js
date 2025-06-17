import server from './src/server.js';
import { SERVER_PORT } from './src/config/env.config.js';

server.listen(SERVER_PORT, () => {
    console.log(
        `Server is running on port http://localhost:${SERVER_PORT}`,
    );
});