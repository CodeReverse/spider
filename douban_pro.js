/**
 * Created by dennis on 16/12/23.
 */
var superagent = require("superagent");
var cheerio = require("cheerio");
var eventproxy = require('eventproxy');
var async = require("async");
var ep = new eventproxy();


var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/doubandb';//数据库名称
var DB_COLLECTION_CULT = 'cult_movie_info';
var DB_COLLECTION_ACTION = 'action_movie_info';//表名

var insertData = function (db, data, callback)
{
    //连接到表
    var collection = db.collection(DB_COLLECTION_ACTION);
    //插入数据
    data.forEach(function (ele)
    {
        collection.insert(ele, function (err, result)
        {
            if (err)
            {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    });

};

var saveData = function (data)
{
    MongoClient.connect(DB_CONN_STR, function (err, db)
    {
        console.log("连接成功！");
        insertData(db, data, function (result)
        {
            console.log(result);
            db.close();
        });
    });
};


var base_url_cult = 'https://movie.douban.com/tag/cult';//cult
var base_url_action = 'https://movie.douban.com/tag/%E5%8A%A8%E4%BD%9C';//动作片

var urlArr = []; //存放分页的url
var movieCount = 0;//存放具体的url
for (var i = 0; i < 5; i++)
{
    var target_url = base_url_action + '?start=' + i * 20 + '&type=T';
    urlArr.push(target_url);
}

function start()
{
    urlArr.forEach(function (pageUrl)
    {
        superagent.get(pageUrl).end(function (err, res)
        {
            if (err)
            {
                return console.log(err);
            } else
            {
                var $ = cheerio.load(res.text);
                var title_link = $('.pl2');
                for (var i = 0; i < title_link.length; i++)
                {
                    var articleUrl = title_link.eq(i).children('a').attr('href');
                    if (!articleUrl.includes('tag'))
                    {
                        movieCount += 1;
                    }
                }
                ep.emit('movie_count', movieCount);
            }
        });
    });

    ep.after('movie_count', urlArr.length, function (count)
    {
        console.log('movie_count', movieCount);
        getPage();
    });
}

function getPage()
{
    urlArr.forEach(function (pageUrl)
    {
        superagent.get(pageUrl).end(function (err, res)
        {
            if (err)
            {
                return console.log(err);
            } else
            {
                var $ = cheerio.load(res.text);
                var title_link = $('.pl2');
                for (var i = 0; i < title_link.length; i++)
                {
                    var articleUrl = title_link.eq(i).children('a').attr('href');
                    if (!articleUrl.includes('tag'))
                    {
                        ep.emit('movie_detail', articleUrl);

                    }

                }
            }


        });
    });

    ep.after('movie_detail', movieCount, function (articleUrls)
    {

        var curCount = 0;
        var reptileMove = function (url, callback)
        {
            //延迟毫秒数
            var delay = parseInt((Math.random() * 30000000) % 1000, 10);
            curCount++;
            console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

            superagent.get(url).end(function (err, sres)
            {

                var $ = cheerio.load(sres.text);
                var movieName = $('h1');
                var year = $('h1 .year');
                console.log(movieName, year);
            });

            setTimeout(function ()
            {
                curCount--;
                callback(null, url + 'Call back content');
            }, delay);
        };

        // 使用async控制异步抓取
        // mapLimit(arr, limit, iterator, [callback])
        // 异步回调
        async.mapLimit(articleUrls, 5, function (url, callback)
        {
            console.log('async');
            reptileMove(url, callback);

        }, function (err, result)
        {
            // 4000 个 URL 访问完成的回调函数
            // ...
            console.dir(result);
        });
    });
};


module.exports = {
    'start': start
};