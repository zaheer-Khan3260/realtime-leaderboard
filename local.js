import server from './src/server.js';
import { SERVER_PORT } from './src/config/env.config.js';
import { connectToDatabase } from './src/config/mongodb.config.js';



connectToDatabase()
.then(() => {
    server.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port : ${SERVER_PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed !!!", err);
})