import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

//Import section

dotenv.config({
  path: "./.env",
});

//Config section

connectDB()
  .then((result) => {
    app.on("error", (error) => {
      console.log("ERRR: ", error);
      throw error;
    });

    
  // ;( async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}`)
//     } catch (error) {
//         console.error("ERROR : ",error);
//         throw err;
//     }
// })();

  //Db connection checking section

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at the port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo DB connection failed !!", err);
  });

    //App start section







