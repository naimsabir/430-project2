const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDeck', mid.requiresLogin, controllers.Chat.getDeck);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/chatPage', mid.requiresLogin, controllers.Chat.chatPage);

  app.post('/makeDeck', mid.requiresLogin, controllers.Chat.makeDeck);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
