var clients = [{
  id: '1',
  name: 'Advanced REST Client',
  consumerKey: 'echo.advancedrestclient.com',
  consumerSecret: 'c2be45e0acaee28986006ad3dba0'
}, {
  id: '2',
  name: 'Simple',
  consumerKey: 'key',
  consumerSecret: 'secret'
}];


exports.find = function(id) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.id === id) {
      return Promise.resolve(client);
    }
  }
  return Promise.resolve(null);
};

exports.findByConsumerKey = function(consumerKey) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.consumerKey === consumerKey) {
      return Promise.resolve(client);
    }
  }
  return Promise.resolve(null);
};
