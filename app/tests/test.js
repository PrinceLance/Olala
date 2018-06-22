//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");

const Route = require('../models/queryModel.js');
const Path = require('../models/pathModel.js');

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
          "originPath" : [["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]]
        });

        let path = Path({
            status: 'failure',
            err_msg: "test1"
          });

        route.save((err, route) => {
          path.token = route._id;
          path.save((err, path) => {
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
     });

      it('it should GET status of error token', (done) => {

        let route = Route({
          "originPath" : [["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]]
        });
 

        let path1 = Path({
            status: 'failure',
            err_msg: "test1"
          });


        let path2 = Path({
            status: 'failure',
            err_msg: "test2"
          });

        route.save((err, route) => {
          path1.token = route._id;
          path2.token = route._id;

          path1.save((err, path) => {
          path2.save((err, path) => {
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
                  res.body.should.have.property('error').eql(" test1 test2");
                done();
              });
            });
        });
        });
      });

      it('it should GET status of success token and return the shortest route', (done) => {

        let route = Route({
          "originPath" : [["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]]
        });
 
         let path1 = Path({
            status: 'success',
            path:[["22.372081", "114.107877"],["22.284419", "114.159510"],["22.326442", "114.167811"]],
            total_distance: 1233,
            total_time: 1233,
            err_msg: "success"
          });


        let path2 = Path({
            status: 'success',
            path:[["22.372081", "114.107877"],["22.326442", "114.167811"],["22.284419", "114.159510"]],
            total_distance: 123,
            total_time: 123,
            err_msg: "success"
          });

       
        route.save((err, route) => {
          path1.token = route._id;
          path2.token = route._id;

          path1.save((err, path) => {
          path2.save((err, path) => {
              chai.request(server)
              .get('/api/v1/route/' + route.id)
              .send(route)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql("success");
                res.body.should.have.property('path').to.deep.equal([["22.372081", "114.107877"],["22.326442", "114.167811"],["22.284419", "114.159510"]]);
                res.body.should.not.have.property('originPath');
                res.body.should.not.have.property('id');
                res.body.should.not.have.property('_id');
                res.body.should.have.property('total_distance').eql(123);
                res.body.should.have.property('total_time').eql(123);
                res.body.should.not.have.property('err_msg');
              done();
            });
          });
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
                    res.body.should.have.property('path').to.deep.equal([["22.372081", "114.107877"],["22.326442", "114.167811"],["22.284419", "114.159510"]]);
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