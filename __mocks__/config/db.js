// Manual mock for config/db used in tests. Simple in-memory users store.
const bcrypt = require('bcryptjs');
let users = [];
let idSeq = 1;

async function query(sql, params) {
  console.log('[mock db] query called:', sql, params);
  sql = (sql || '').toLowerCase();

  // Check existing user by email
  if (sql.includes('select id from users where email')) {
    const email = params[0];
    const found = users.filter(u => u.email === email).map(u => ({ id: u.id }));
    return [found, []];
  }

  // Select * from users where email
  if (sql.includes('select * from users where email')) {
    const email = params[0];
    const found = users.filter(u => u.email === email);
    return [found, []];
  }

  // Insert into users
  if (sql.includes('insert into users')) {
    const [name, email, phone, hashedPassword, role] = params;
    const user = { id: idSeq++, name, email, phone, password: hashedPassword, role };
    users.push(user);
    return [{ insertId: user.id }, []];
  }

  // Select id,name,email,phone,role by id
  if (sql.includes('select id, name, email, phone, role from users where id')) {
    const id = params[0];
    const found = users.filter(u => u.id === id).map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role }));
    return [found, []];
  }

  // Fallback: return empty
  return [[], []];
}

module.exports = { query };
