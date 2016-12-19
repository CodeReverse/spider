/**
 * Created by dennis on 16/12/7.
 */
var fs = require('fs');

var json;
var arr = new Array();
var map = new Map();
var fileArray;
function scanDir(filePath)
{
    var stat = fs.lstatSync(filePath);
    if (stat.isDirectory())
    {
        fs.readdir(filePath, function (err, files)
        {
            if (err)
            {
                throw err;
                return;
            } else
            {
                fileArray = files;
                if(fileArray.length>0){
                   var temp= fileArray.shift();
                }
                files.forEach(function (file)
                {
                    if (!file.includes('.DS_Store'))
                    {
                        var tempPath = filePath + "/" + file;
                        scanDir(tempPath);
                    }
                });
            }
        });
    } else
    {
        var stat = fs.statSync(filePath);
        // fileInfo.name = filePath;
        // fileInfo.mtime = stat.ctime;
        // console.log(fileInfo);
        // arr.push(fileInfo);
        // console.log(arr.length);
        map.set(filePath, stat.ctime);
    }
}

function generateJson()
{


}

function saveFileInfo(param)
{
    fs.writeFile('file_info.txt', param, function (err)
    {
        if (err)
        {
            console.log(err);
        } else
        {
            console.log('ok');
        }
    });
}

module.exports = {
    'scanDir': scanDir,
    'saveFileInfo': saveFileInfo
};