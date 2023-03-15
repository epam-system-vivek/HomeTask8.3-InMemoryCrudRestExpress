const Joi = require('joi')
const bodyParser = require('body-parser');
const app = require('express')()
const validator = require('express-joi-validation').createValidator({})
const uuid = require('uuid');
app.use(bodyParser.json());
//valdations to fields
const userSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required(),
  age: Joi.number().integer().min(4).max(130).required(),
});
// Test data
let users = [
  {
    id: uuid.v4(),
    login: 'Bhavya',
    password: 'abc2345',
    age: 25,
    isDeleted: false
  },
  {
    id: uuid.v4(),
    login: 'bhumi',
    password: 'b1h2u3',
    age: 30,
    isDeleted: false
  },
  {
    id: uuid.v4(),
    login: 'shriya',
    password: 'shr1234',
    age: 20,
    isDeleted: false
  }
];

// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Get a user by id
app.get('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id);
  res.json(user);
});
//add user by post
app.post('/users', (req, res) => {
  const { login, password, age } = req.body;
  const { error, value } = userSchema.validate({ login, password, age });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newUser = { id: uuid.v4(), login, password, age, isDeleted: false };
  users.push(newUser);
  res.status(201).json(newUser);
});
//update existing user by put
app.put('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id);
  if (!user || user.isDeleted) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { login, password, age } = req.body;
  const { error, value } = userSchema.validate({ login, password, age });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (login) {
    user.login = login;
  }
  if (password) {
    user.password = password;
  }
  if (age) {
    user.age = age;
  }
  res.json(user);
});
// Delete a user by id
app.delete('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id);
  if (!user || user.isDeleted) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.isDeleted = true;
  res.sendStatus(204);
});

// Get auto-suggest list from limit users, sorted by login property and filtered by loginSubstring in the login property
//http://localhost:3000/users/autosuggest/bhu/1

app.get('/users/autosuggest/:loginSubstring/:limit', (req, res) => {
  const { loginSubstring, limit } = req.params;
  const filteredUsers = users
    .filter(user => user.login.includes(loginSubstring))
    .sort((a, b) => a.login.localeCompare(b.login))
    .slice(0, limit);
  res.json(filteredUsers);
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

