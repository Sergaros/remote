const Busboy = require('busboy');
const {inspect} = require('util');

exports.requestDataParser = (req)=>{
    return new Promise ((resolve, reject)=>{
        let busboy = new Busboy({ headers: req.headers });
        let rawContent = [];

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            //console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.on('data', function(data) {
                //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                rawContent.push(data);
            });

            file.on('end', function() {
                //console.log('File [' + fieldname + '] Finished');
            });

            file.on('error', function(err) {
                //console.log('File [' + fieldname + '] Finished');
                reject(err);
            });
        });

        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            //console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        });
        busboy.on('finish', function() {
            //console.log('Done parsing form!');

            const buffer = Buffer.concat(rawContent);
            //console.log(buffer.toString('utf-8'));
            try {
                let parsingData = JSON.parse(buffer.toString('utf-8'));
                resolve(parsingData);
            } catch (e) {
                reject(e);
            }

        });

        req.pipe(busboy);
    });
};
