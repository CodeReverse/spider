/**
 * Created by dennis on 16/12/6.
 */
var http = require('http');
var cheerio = require('cheerio');
var superagent = require('superagent');
var path = require('path');
var io = require('./io');
var fs = require('fs');

var cookie;
var url = {
    url: 'https://www.zhihu.com/#signin',
    login_url: 'https://www.zhihu.com/login/email',
    target_url: 'https://www.zhihu.com',
    captcha_url: 'https://www.zhihu.com/captcha.gif'
};

var browserMsg = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36",
    'Connection': 'Keep-Alive',
    'Accept': 'text/html, application/xhtml+xml, */*',
    'Accept-Language': 'en-US,en;q=0.8,zh-Hans-CN;q=0.5,zh-Hans;q=0.3',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'www.zhihu.com',
    'DNT': '1'
};


var loginMsg = {
    _xsrf: '',
    password: "wenhounim",
    email: '540431546@qq.com'

};

function getXsrf()
{
    superagent.get(url.url).end(function (err, res)
    {
        if (err)
        {
            console.dir(err);
            return err;
        } else
        {
            var $ = cheerio.load(res.text);
            loginMsg._xsrf = $('[name=_xsrf]').attr('value');
            console.log('_xsrf:', loginMsg._xsrf);
            getCookie();
        }
    });
}

function getCookie()
{
    superagent.post(url.login_url).set(browserMsg).send(loginMsg).end(function (err, res)
    {
        if (!err)
        {
            console.log(res.body);
            cookie = res.headers["set-cookie"];
            // if (cookie.z_c0)
            // {
            //     login();
            // } else
            // {
            //     getCaptcha();
            // }
            console.log(cookie);
        } else
        {
            console.dir(err);
        }


    });
}

function getCaptcha()
{
    var date = new Date();
    superagent.get(url.captcha_url).send({
        'type': 'login',
        'r': date.getTime()
    }).end(function (err, res)
    {
        if (err)
        {
            console.log(err);
        } else
        {
            fs.writeFile('./captcha.jpg', res.body, function (err)
            {
                if (err)
                {
                    console.log(err);
                } else
                {
                    // setTimeout(function ()
                    // {
                    //
                    //     fs.readFile('./code.txt', 'utf-8', function (err, data)
                    //     {
                    //         if (!err)
                    //         {
                    //             loginMsg.captcha = data;
                    //             console.log(loginMsg.captcha);
                    //             getCookie();
                    //         }
                    //     });
                    // }, 10000);

                }
            });
        }
    });
}

var titleArr = [];
function login()
{
    superagent.get(url.target_url).set('Cookie', cookie).set(browserMsg).end(function (err, res)
    {
        if (err)
        {
            console.dir(err);
            return;
        } else
        {
            var $ = cheerio.load(res.text);
            var title = $('.feed-title a').each(function (i, ele)
            {
                var titleInfo = {
                    'title_link': $(ele).attr('href'),
                    'title': $(ele).text()
                };
                titleArr.push(titleInfo);
            });

            console.log(titleArr);
        }
    });
}


module.exports = {
    'getXsrf': getXsrf,
    'getCookie': getCookie,
    'getCaptcha': getCaptcha
};