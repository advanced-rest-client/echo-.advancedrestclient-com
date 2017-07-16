var tokens = {};

exports.find = function(key) {
  var token = tokens[key];
  return Promise.resolve(token);
};

exports.save = function(token, secret, clientID, callbackURL) {
  tokens[token] = {
    secret: secret,
    clientID: clientID,
    callbackURL: callbackURL
  };
  return Promise.resolve();
};

exports.approve = function(key, userID, verifier) {
  var token = tokens[key];
  token.userID = userID;
  token.verifier = verifier;
  token.approved = true;
  return Promise.resolve();
};
