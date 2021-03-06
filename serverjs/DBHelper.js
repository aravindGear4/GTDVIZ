'use strict';
//Ref: https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var ProcessHelper=require('./ProcessHelper');
var TABLE_NAME='events';
var TABLE_NAME2='agg_events';
// Connection URL
var url = 'mongodb://localhost:27017/gtd';

module.exports = {
  callFn: function(a, callback){
    console.log('In the DBHelpper:'+a);
    callback(a+10);
  },
  //gives data without any aggregation between the given years
  findAllByyr: function(startyr, endyr,callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      var collection = db.collection(TABLE_NAME);
      //added projection
     collection.find(
         {iyear:{ $gte: startyr, $lte: endyr }}, {iyear: 1, longitude: 1, latitude: 1, eventid: 1, country_txt: 1, weaptype1_txt: 1, gname: 1, target1: 1, targtype1_txt:1, attacktype1_txt :1,
           nkill : 1,nwound : 1,nperps : 1,nkillter : 1, region_txt: 1}
         ).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          //console.log(docs[0]);
          ProcessHelper.proPrecessData(docs);
          callback(docs);
          db.close();
        });
    });
  },

  //gives aggregated data by organisation
  //columsn given year and region, Number of Events, Number kills, Number of kills
  aggregateEventsByOrg: function(startyr, endyr, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      var collection = db.collection(TABLE_NAME);

     collection.aggregate([
              {$match: {iyear:{ $gte: startyr, $lte: endyr }}},
              {$group:
                {'_id': {gname: '$gname'},
                numEvents : {$sum: 1},
                nkill : {$sum: '$nkill'},
                nwound : {$sum: '$nkill'},
                nperps : {$sum: '$nperps'},
                nkillter : {$sum: '$nkillter'},
              }},
              { $sort : { nkill : -1, nperps: -1 } },

          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          callback(docs);
          db.close();
        });
    });
  },
  //gives aggregated data by county
  //columsn given year and region, Number of Events, Number kills, Number of kills
  aggregateEventsByCountry: function(startyr, endyr, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      var collection = db.collection(TABLE_NAME);

     collection.aggregate([
              {$match: {iyear:{ $gte: startyr, $lte: endyr }}},
              {$group:
                {'_id': {country_txt: '$country_txt'},
                numEvents : {$sum: 1},
                nkill : {$sum: '$nkill'},
                nwound : {$sum: '$nkill'},
                nperps : {$sum: '$nperps'},
                nkillter : {$sum: '$nkillter'},
              }
            },
            { $sort : { nkill : -1, nperps: -1 } },
          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          callback(docs);
          db.close();
        });
    });
  },

  //gives aggregated data on year and region
  //columsn given year and region, Number of Events, Number kills, Number of kills
  aggregateEventsWithYearAndCont: function(startyr, endyr, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      var collection = db.collection(TABLE_NAME);

     collection.aggregate([
              {$match: {iyear:{ $gte: startyr, $lte: endyr }}},
              {$group:
                {'_id': {year: '$iyear', continent: '$region_txt'},
                numEvents : {$sum: 1},
                nkill : {$sum: '$nkill'},
                nwound : {$sum: '$nkill'},
                nperps : {$sum: '$nperps'},
                nkillter : {$sum: '$nkillter'},
              }
              }
          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          callback(docs);
          db.close();
        });
    });
  },

  aggregateEventsWithYear: function(startyr, endyr, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      var collection = db.collection(TABLE_NAME);

     collection.aggregate([
              {$match: {iyear:{ $gte: startyr, $lte: endyr }}}
            , {$group:
                {_id: '$iyear',
                count : {$sum: 1}
              }
              }
          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          callback(docs);
          db.close();
        });
    });
  },

  aggregateEventsByYrs: function(callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
      var collection = db.collection(TABLE_NAME);

     collection.aggregate([
              {$match: {}}
            , {$group:
                {_id: '$iyear',
                //total: {$sum: '$nkill'},
                count : {$sum: 1}
              }
              }
          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          callback(docs);
          db.close();
        });
    });
  },
  //gives aggregated data by organisation
//columsn given year and region, Number of Events, Number kills, Number of kills

getUnique: function(attr, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var collection = db.collection(TABLE_NAME);
      collection.distinct(attr)
        .then(function(results) {
            //callback(ProcessHelper.preProcessArray(results));
            callback(results);
            db.close();
       });
     });
   },


getSelectedDataplot: function(startyr, endyr, category, jsonData, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server"+startyr+":"+ typeof endyr);
      console.log("Supermannnnnnnnnnnnnnnnn!")
      var collection = db.collection(TABLE_NAME2);
      var query={};
      var aiyear=category+'_iyear';
      var anumEvents=category+'_numEvents';
      query[aiyear]={ $gte: startyr, $lte: endyr };
        query[category]={$in : jsonData}
      console.log(query);
      var additions={};
      additions[aiyear]=1;
      additions[anumEvents]=1;
      additions[category]=1;
      console.log(additions);
     collection.find(
         query/*gname_iyear:{ $gte: startyr, $lte: endyr },gname:{$in: ['Unknown']}*/, additions /*{gname_iyear: 1,gname: 1,gname_numEvents: 1}*/
         ).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
          //console.log(docs[0]);
      var sendingdata =[];
      for(var variable in jsonData)
        {
//          console.log(variable);
          sendingdata.push(jsonData[variable]);
        }


         docs=ProcessHelper.convertJsonTo2dArray(docs,category,sendingdata,startyr,endyr);
          callback(docs);
          db.close();
        });
    });
  },



/*   getSelectedDataplot: function(startyr, endyr, category, jsonData, callback){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      var collection = db.collection(TABLE_NAME2);
      //console.log(typeof(jsonData));
        jsonData=jsonData.sort();
      var sendingdata =[];
      for(var variable in jsonData)
        {
//          console.log(variable);
          sendingdata.push(jsonData[variable]);
        }

        var query={};
        query.gname_iyear={ $gte: startyr, $lte: endyr };
        query[category]={$in : jsonData};
        var addition={}
        addition.year= '$'+category+'_iyear';
        addition.valname= '$'+category;
        console.log(addition);
        console.log(query);
//        console.log("a");

     collection.aggregate([
              {$match: query},
              {$group:
                {'_id': addition,
                numEvents : {$sum: 1},
                nkill : {$sum: '$nkill'},
                nwound : {$sum: '$nkill'},
                nperps : {$sum: '$nperps'},
                nkillter : {$sum: '$nkillter'},
              }
              }
          ]).toArray(function(err, docs) {
          assert.equal(null, err);
          console.log('In the DBHelper'+docs.length);
         docs=ProcessHelper.convertJsonTo2dArray(docs,sendingdata,startyr,endyr);

          callback(docs);
          db.close();
        });
    });
  },*/

    getplotSelectedData: function(startyr, endyr, category, jsonData, callback){
        MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          var collection = db.collection(TABLE_NAME);
            var query={};
            query.iyear={ $gte: startyr, $lte: endyr };
            query[category]={$in : jsonData};
        console.log(JSON.stringify(query));
         collection.find(query,
             {iyear: 1, longitude: 1, latitude: 1, eventid: 1, country_txt: 1, weaptype1_txt: 1, gname: 1, target1: 1, targtype1_txt:1, attacktype1_txt :1,
               nkill : 1,nwound : 1,nperps : 1,nkillter : 1, region_txt: 1}).toArray(function(err, docs) {
              assert.equal(null, err);
              console.log('In the DBHelper'+docs.length);
              ProcessHelper.preProcessData(docs);
              callback(docs);
              db.close();
            });
    })
    },

    getEventDetails: function(eventidVar, callback){
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            var collection = db.collection(TABLE_NAME);
            var query={};
            query['eventid']=+eventidVar;
            console.log(JSON.stringify(query));
            collection.find(query
                ).toArray(function(err, docs) {
                assert.equal(null, err);
                //ProcessHelper.preProcessData(docs);
                callback(docs[0]);//ProcessHelper.deleteEmptyFields(docs[0]));
                db.close();
            });
        })
    }
};


