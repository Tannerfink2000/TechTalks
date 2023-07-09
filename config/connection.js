const Sequelize = require('sequelize');
require('dotenv').config({
  path: require('find-config')('.env')
});

let sequelize;

//checks to see if session w/b initialized from db in cloud server on heroku or local machine
if (process.env.JAWSDB_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_URL);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306
    }
  );
}

module.exports = sequelize;