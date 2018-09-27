const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const db = require('../db');

before(async () => {
    await db.sequelize.sync({force: true});

    const userInstance = await db.user.create({
        email: 'test@gmail.com',
        password: '123HFklsdfa',
    });

    const token = userInstance.generateToken('authentication');

    const tokenInstance = await db.token.create({ token });

    this.tokenStr = tokenInstance.get('token');

    await db.todo.create({
        description: 'do something',
        completed: false,
        userId: 1
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('Auth', this.tokenStr)
            .expect(200)
            .expect(res => {
                expect(res.body.length).toBe(1);
            })
            .end(done);
    });
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const description = 'test todo text';

        request(app)
            .post('/todos')
            .set('Auth', this.tokenStr)
            .send({
                description
            })

            .expect(200)
            .expect(res => {
                console.log(res.body);
                expect(res.body.description).toBe(description);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                db.todo.findAll({
                    where: {
                        userId: 1
                    }
                })
                    .then(todos => {
                        expect(todos.length).toBe(2);
                        expect(todos[1].description).toBe('abc');
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it.skip('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                db.todo.findAll({})
                    .then(todos => {
                        expect(todos.length).toBe(0);
                        done();
                    })
                    .catch(err => done(err));
            });
    });
});


