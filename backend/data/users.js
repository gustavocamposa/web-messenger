const users = [];

function findUserByEmail(email) {
  const userEmail = users.find((user) => user.email === email);
  return userEmail;
}

function findUserById(id) {
  const userId = users.find((user) => user.id === id);
  return userId;
}

function createUser({ email, password }) {
  const id = randomUUID();
  const passwordHash = bcrypt.hash(password, 10);
  const newUser = { id, email, passwordHash };
  users.push(newUser);
  return newUser;
}

export { users, findUserByEmail, findUserById, createUser };
