var tokens = {};


exports.find = function(key) {
  var token = tokens[key];
  return Promise.resolve(token);
};

exports.save = function(token, secret, userID, clientID) {
  tokens[token] = {
    secret: secret,
    userID: userID,
    clientID: clientID
  };
  return Promise.resolve();
};
