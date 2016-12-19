/**
 * Created by dennis on 16/12/5.
 */
var jq22 = require('./jq22');
var io = require('./io');
var zhihu = require('./zhihu');
var scanFile = require('./scanFile');
var douban = require('./douban.js');
// io.createFileDir('html');
// //  jq22.start();
//   zhihu.getXsrf();
//   zhihu.getCaptcha();
// zhihu.getCookie();
// zhihu.login();

douban.start();
