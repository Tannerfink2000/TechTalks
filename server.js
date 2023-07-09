//import all modules
const path = require('path');
const express = require('express');
const exhbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./util/helpers');
const sequelize = require('./config/connection');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);


const app = express();
const PORT = process.env.PORT || 3001;

// Set up sessions
const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};
app.use(session(sess));

// create hb engine object that will hold helper fncs
const hbs = exhbs.create({ helpers });

//communicate to express.js we are using hbs as template engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//parsing middleware & setting public folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//set routes up in express
app.use(routes);

//sync database
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
});