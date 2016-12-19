/**
 * Created by dennis on 16/12/5.
 */
var fs = require('fs');
var superagent = require('superagent');

var createFileDir = function (dirName, dirPath)
{
    if (!dirName)
    {
        throw new Error('file name couldn\'t be null');
        return;
    } else
    {
        var a = dirPath ? dirPath + dirName : './' + dirName;
        fs.exists(a, function (exists)
        {
            if (!exists)
            {
                fs.mkdir(a, function (err)
                {
                    if (err)
                    {
                        throw err;
                        return;
                    }
                    else
                    {
                        console.log('mkdir success!');
                        return a;
                    }
                });
            } else
            {
                throw new Error('dir exist!');
                return;
            }
        });
    }

}

var saveFile = function (targetUrl, fileName, fileDir)
{
    if (!targetUrl)
    {
        throw new Error('targetUrl couldn\'t be empty!');
        return;
    } else
    {
        var dirPath = fileDir ? fileDir : createFileDir('File');
        var filePath = dirPath + '/' + fileName;
        fs.exists(filePath, function (exists)
        {
            if (!exists)
            {
                var stream = fs.createWriteStream(filePath);
                superagent.get(targetUrl).pipe(stream).on('close', function ()
                {
                    console.log('save file success!');
                });
            } else
            {
                throw new Error('file exists!');
                return;
            }
        });
    }

}

module.exports = {
    "createFileDir": createFileDir,
    "saveFile": saveFile
}
