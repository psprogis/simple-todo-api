const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const Todo = require('../models/todo');
const db = require('../db');

// describe('GET /todos', () => {
//     // before(async () => {
//     //     request(app).get
//     // })
//
//     it('should return empty list if no todos in database', (done) => {
//         request(app)
//             .post('/users/login')
//             .expect(res => {
//                 console.log(res.status)
//             })
//             .end(done);
//     });
// });

// beforeEach((done) => {
//     // Todo.remove({}).then - sync: true should work
// });

describe('POST /todos', () => {
    it.skip('should create a new todo', (done) => {
        const text = 'test todo text';

        request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
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
