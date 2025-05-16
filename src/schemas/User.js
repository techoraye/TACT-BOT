// @schemas/User.js

// Example of Mongoose model import, adjust based on your setup.
const User = require("./models/User"); // Adjust the path to your User model if necessary

// This function retrieves the user data from the database based on their Discord user ID
async function getUser(user) {
  // Assuming you have a User model that stores user data
  // You may need to adjust based on your database setup (Mongoose or others)
  return await User.findOne({ userId: user.id });
}

// Export the function so it can be used elsewhere in your bot
module.exports = { getUser };
