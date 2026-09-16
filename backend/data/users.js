const users = [];

function findUserByEmail(email) {
  const userEmail = users.find((user) => user.email === email);
  return userEmail;
}

function findUserById(id) {
  const userId = users.find((user) => user.id === id);
  return userId;
}

function createUser({ id, email, passwordHash }) {
  const newUser = { id, email, passwordHash };
  users.push(newUser);
  return newUser;
}

export { users, findUserByEmail, findUserById, createUser };
