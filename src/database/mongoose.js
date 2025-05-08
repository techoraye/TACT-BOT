const mongoose = require("mongoose");
const { log, success, error } = require("../helpers/Logger");

mongoose.set("strictQuery", true);

module.exports = {
  async initializeMongoose() {
    log(`Connecting to MongoDb...`);

    try {
      // Use serverSelectionTimeoutMS for a longer connection timeout (default is 30 seconds)
      await mongoose.connect(process.env.MONGO_CONNECTION, {
        serverSelectionTimeoutMS: 30000,  // 30 seconds timeout
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      success("Mongoose: Database connection established");

      return mongoose.connection;
    } catch (err) {
      error("Mongoose: Failed to connect to database", err);
      process.exit(1);
    }
  },

  schemas: {
    Guild: require("./schemas/Guild"),
    Member: require("./schemas/Member"),
    ReactionRoles: require("./schemas/ReactionRoles").model,
    ModLog: require("./schemas/ModLog").model,
    TranslateLog: require("./schemas/TranslateLog").model,
    User: require("./schemas/User"),
    Suggestions: require("./schemas/Suggestions").model,
  },
};
