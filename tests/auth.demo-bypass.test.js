const request = require('supertest');

jest.mock('../config/db', () => require('../__mocks__/config/db'));
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const app = require('../server');

describe('Auth protection', () => {
  test('protected routes reject requests without a valid session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
