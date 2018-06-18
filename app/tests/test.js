//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Route = require('../../app/models/model.js');

var fs = require('fs');
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server.js');
let should = chai.should();

chai.use(chaiHttp);

//Our parent block
describe('Route', () => {
    before((done) => { //Before each test we empty the database
        Route.remove({}, (err) => { 
           done();         
        });     
    });


  /*
  * Test the /POST route
  */

  describe('/POST /route', () => {
      it('it should not POST a route with no waypoint', (done) => {
        chai.request(server)
            .post('/api/v1/route')
            .send([])
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                done();
            });
      });

      it('it should not POST a route with only one waypoint', (done) => {
        chai.request(server)
            .post('/api/v1/route')
            .send([["22.372081", "114.107877"]])
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
              done();
            });
      });
  
      it('it should  POST a route with two waypoint', (done) => {
        chai.request(server)
            .post('/api/v1/route')
            .send([["22.372081", "114.107877"],["22.326442", "114.167811"]])
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
              done();
            });
      });

  
      it('it should  POST a route with two waypoint', (done) => {
        chai.request(server)
            .post('/api/v1/route')
            .send([["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]])
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
              done();
            });
      });

    describe('/GET /route:id ', () => {
      it('it should not GET status of inexisting token', (done) => {

          chai.request(server)
          .get('/api/v1/route/' + 'hdoiajso')
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('message');
              res.body.should.not.have.property('status');
              res.body.should.not.have.property('path');
              res.body.should.not.have.property('originPath');
              res.body.should.not.have.property('id');
              res.body.should.not.have.property('_id');
              res.body.should.not.have.property('total_distance');
              res.body.should.not.have.property('total_time');
              res.body.should.not.have.property('err_msg');
            done();
          });
      });

      it('it should GET status of token in progress', (done) => {

        let route = Route({
          "status": "in progress",
          "originPath" : [["22.372081", "114.107877"],["22.326442", "114.167811"]],
          "path": [],
          "total_distance": 0,
          "total_time": 0,
          "err_msg": "in progress"
        });
        
        route.save((err, route) => {
            chai.request(server)
            .get('/api/v1/route/' + route.id)
            .send(route)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql("in progress");
                res.body.should.not.have.property('path');
                res.body.should.not.have.property('originPath');
                res.body.should.not.have.property('id');
                res.body.should.not.have.property('_id');
                res.body.should.not.have.property('total_distance');
                res.body.should.not.have.property('total_time');
                res.body.should.not.have.property('err_msg');
              done();
            });
        });
      });

      it('it should GET status of error token', (done) => {

        let route = Route({
          "status": "failure",
          "originPath" : [["22.372081", "114.107877"],["22.326442", "114.167811"]],
          "path": [["22.372081", "114.107877"],["22.326442", "114.167811"],["22.372081", "114.107877"],["22.326442", "114.167811"]],
          "total_distance": 0,
          "total_time": 0,
          "err_msg": "test"
        });
        
        route.save((err, route) => {
            chai.request(server)
            .get('/api/v1/route/' + route.id)
            .send(route)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql("failure");
                res.body.should.not.have.property('path');
                res.body.should.not.have.property('originPath');
                res.body.should.not.have.property('id');
                res.body.should.not.have.property('_id');
                res.body.should.not.have.property('total_distance');
                res.body.should.not.have.property('total_time');
                res.body.should.not.have.property('err_msg');
                res.body.should.have.property('error').eql("test");
              done();
            });
        });
      });

      it('it should GET status of success token', (done) => {

        let route = Route({
          "status": "success",
          "originPath" : [["22.372081", "114.107877"],["22.326442", "114.167811"]],
          "path": [["22.372081", "114.107877"],["22.326442", "114.167811"],["22.372081", "114.107877"],["22.326442", "114.167811"]],
          "total_distance": 10,
          "total_time": 23,
          "err_msg": "in progress"
        });
        
        route.save((err, route) => {
            chai.request(server)
            .get('/api/v1/route/' + route.id)
            .send(route)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql("success");
                res.body.should.have.property('path').to.deep.equal([["22.372081", "114.107877"],["22.326442", "114.167811"],["22.372081", "114.107877"],["22.326442", "114.167811"]]);
                res.body.should.not.have.property('originPath');
                res.body.should.not.have.property('id');
                res.body.should.not.have.property('_id');
                res.body.should.have.property('total_distance').eql(10);
                res.body.should.have.property('total_time').eql(23);
                res.body.should.not.have.property('err_msg');
              done();
            });
        });
      });
    });

    describe('integrated test', () => {
      it('if I go from tw to central to somewere in NT, it should be ok', (done) => {
        chai.request(server)
            .post('/api/v1/route')
            .send([["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]])
            .end((err, res) => {

                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');

                var token = JSON.parse(res.text);

                chai.request(server)
                .get('/api/v1/route/' + token.token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql("success");
                    res.body.should.have.property('path').to.deep.equal([["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]]);
                    res.body.should.not.have.property('originPath');
                    res.body.should.not.have.property('id');
                    res.body.should.not.have.property('_id');
                    res.body.should.have.property('total_distance');
                    res.body.should.have.property('total_time');
                    res.body.should.not.have.property('err_msg');
                });

                done();
            });
      });
    });
  });
});