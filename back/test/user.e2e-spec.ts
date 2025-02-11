import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';

describe('User Module (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  let createdUserId: string;
  let jwtToken: string;

  const initialUsername = 'testUser' + Date.now();
  const initialPassword = 'testPassword123';

  const updatedUsername = 'updatedUser' + Date.now();
  const updatedPassword = 'updatedPassword123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users/register - should create a new user', async () => {
    const response = await request(httpServer)
      .post('/users/register')
      .send({
        username: initialUsername,
        password: initialPassword
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username', initialUsername);

    createdUserId = response.body.id;
  });

  it('POST /users/login - should authenticate the user and return a JWT', async () => {
    const response = await request(httpServer)
      .post('/users/login')
      .send({
        username: initialUsername,
        password: initialPassword
      })
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('access_token');
    expect(Array.isArray(response.body.accounts)).toBe(true);

    jwtToken = response.body.access_token;
  });

  it('PATCH /users - should update the user’s details (username and password)', async () => {
    const updateResponse = await request(httpServer)
      .patch('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        username: updatedUsername,
        password: updatedPassword
      })
      .expect(HttpStatus.OK);

    expect(updateResponse.body).toHaveProperty('id', createdUserId);
    expect(updateResponse.body).toHaveProperty('username', updatedUsername);
  });

  it('POST /users/login - should authenticate with updated credentials', async () => {
    const loginAgain = await request(httpServer)
      .post('/users/login')
      .send({
        username: updatedUsername,
        password: updatedPassword
      })
      .expect(HttpStatus.OK);

    expect(loginAgain.body).toHaveProperty('access_token');
    expect(Array.isArray(loginAgain.body.accounts)).toBe(true);

    jwtToken = loginAgain.body.access_token;
  });

  it('DELETE /users - should delete the authenticated user', async () => {
    await request(httpServer).delete('/users').set('Authorization', `Bearer ${jwtToken}`).expect(HttpStatus.NO_CONTENT);
  });

  it('POST /users/login - should fail with 401 Unauthorized for a deleted user', async () => {
    await request(httpServer)
      .post('/users/login')
      .send({
        username: updatedUsername,
        password: updatedPassword
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('PATCH /users - should fail with 404 Not Found when updating a deleted user', async () => {
    await request(httpServer)
      .patch('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ username: 'someOtherUser' })
      .expect(HttpStatus.NOT_FOUND);
  });
});
