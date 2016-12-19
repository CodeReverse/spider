/**
 * Created by dennis on 16/12/14.
 */
var util = require('util');
var superagent = require("superagent");
var cheerio = require("cheerio");
var async = require("async");
var eventproxy = require('eventproxy');
var ep = new eventproxy();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/doubandb';//数据库名称

var insertData = function (db, data, callback) {
    //连接到表
    var collection = db.collection('movie_info');//表名
    //插入数据
    data.forEach(function (ele) {
        collection.insert(ele, function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }

        });
    });
    callback(result);
};

var saveData = function (data) {
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        console.log("连接成功！");
        insertData(db, data, function (result) {
            console.log(result);
            db.close();
        });
    });
};


var base_url = 'https://movie.douban.com/tag/cult';

var urlArr = [];
for (var i = 0; i < 21; i++) {
    var target_url = base_url + '?start=' + i * 20 + '&type=T';
    urlArr.push(target_url);
}
var count = 0;
function start() {
    urlArr.forEach(function (pageUrl) {
        var movieArr = [];
        superagent.get(pageUrl).end(function (err, res) {
            if (err) {
                return console.log(err);
            } else {
                var $ = cheerio.load(res.text);
                $('table').each(function (i, ele) {
                    var movieInfo = {};
                    movieInfo.detail_link = $(ele).find('.nbg').attr('href');
                    movieInfo.src = $(ele).find('.nbg').children('img').attr('src');
                    movieInfo.name = $(ele).find('.nbg').children('img').attr('alt');
                    movieInfo.rating_nums = $(ele).find('.rating_nums').text();
                    if (movieInfo.detail_link && movieInfo.src && movieInfo.name && movieInfo.rating_nums) {
                        movieArr.push(movieInfo);
                        console.log(movieInfo);
                    }

                });
                ep.emit('movieInfo', movieArr);
            }
        });
    });

}

var result;
ep.after('movieInfo', urlArr.length, function (data) {
    saveData(data);
});

module.exports = {
    'start': start
};