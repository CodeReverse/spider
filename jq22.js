/**
 * Created by dennis on 16/12/5.
 */

var http = require('http');
var cheerio = require('cheerio');
var superagent = require('superagent');
var path = require('path');
var io = require('./io');

var targetUrl = "http://www.jq22.com";
var urlArray = [];
function start() {
    superagent.get(targetUrl).end(function (err, pres) {
        if (err) {
            console.log(err);
            return;
        } else {
            var $ = cheerio.load(pres.text);
            var a = $('.cover-info a').each(function (i, ele) {
                var a = $(ele).attr('href');
                urlArray.push(a);
            });
        }

        urlArray.forEach(function (url) {
            io.saveFile(url, path.basename(url)+'.html', './html');
        });
    });

}

module.exports = {
    "start": start
};