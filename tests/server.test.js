const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const db = require('../db');

const initialTodos = [
    {
        description: 'first todo item',
        completed: false,
        userId: 1
    },
    {
        description: 'second todo item',
        completed: true,
        userId: 1
    }
];

before(async () => {
    await db.sequelize.sync({force: true});

    const userInstance = await db.user.create({
        email: 'test@gmail.com',
        password: '123HFklsdfa',
    });

    const token = userInstance.generateToken('authentication');

    const tokenInstance = await db.token.create({ token });

    this.tokenStr = tokenInstance.get('token');

    initialTodos.forEach(async todo => await db.todo.create(todo));
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('Auth', this.tokenStr)
            .expect(200)
            .expect(res => {
                expect(res.body.length).toBe(initialTodos.length);
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
                        expect(todos.length).toBe(initialTodos.length + 1);
                        expect(todos[2].description).toBe(description);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('Auth', this.tokenStr)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                db.todo.findAll({})
                    .then(todos => {
                        expect(todos.length).toBe(initialTodos.length + 1);
                        done();
                    })
                    .catch(err => done(err));
            });
    });
});

describe('GET /todos:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/1`)
            .set('Auth', this.tokenStr)
            .expect(200)
            .expect(res => {
                console.log(res.body);
                expect(res.body.description).toBe(initialTodos[0].description);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        // TODO: generate real id

        request(app)
            .get(`/todos/xxxx`)
            .set('Auth', this.tokenStr)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .set('Auth', this.tokenStr)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {

    it('should remove a todo', (done) => {
        const todo = initialTodos[0];

        request(app)
            .delete(`/todos/1`)
            .set('Auth', this.tokenStr)
            .expect(200)
            .expect(res => {
                expect(res.body.id).toBe(todo.id);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                db.todo.findById(todo.id)
                    .then(todo => {
                        expect(todo).toBeFalsy();
                        done();
                    })
                    .catch(e => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/9999`)
            .set('Auth', this.tokenStr)
            .expect(404)
            .end(done);
    });

    it('should return 404 if id is invalid', (done) => {
        request(app)
            .get(`/todos/sdfaxxxx`)
            .set('Auth', this.tokenStr)
            .expect(404)
            .end(done);
    });
});

xdescribe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const todo = initialTodos[1];
        const text = 'new text';

        request(app)
            .put(`/todos/2`)
            .set('Auth', this.tokenStr)
            .send({
                text,
                completed: true
            })
            .expect(200)
            .expect(res => {
                expect(res.body.description).toBe(text);
                expect(res.body.completed).toBe(true);
            })
            .end(done);
    });
});
