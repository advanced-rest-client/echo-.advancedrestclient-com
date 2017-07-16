var users = [{
    id: '1',
    username: 'arc',
    password: 'passwd',
    name: 'ARC OAuth 1 Echo user'
  },
  {
    id: '2',
    username: 'joe',
    password: 'password',
    name: 'Joe Davis'
  }
];

exports.find = function(id) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.id === id) {
      return Promise.resolve(user);
    }
  }
  return Promise.resolve(null);
};

exports.findByUsername = function(username) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return Promise.resolve(user);
    }
  }
  return Promise.resolve(null);
};
