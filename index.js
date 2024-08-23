var aws = require('aws-sdk');
const core = require('@actions/core');
var path = require("path");
var fs = require('fs');
var mime = require('mime');
var crypto = require('crypto');

try {
    const accountid = core.getInput('accountid');
    const accesskeyid = core.getInput('accesskeyid');
    const secretaccesskey = core.getInput('secretaccesskey');
    const bucket = core.getInput('bucket');
    const source = core.getInput('source');
    const destination = core.getInput('destination');

    const uploadDir = function(s3Path, bucketName) {

        var s3 = new aws.S3({
                accessKeyId: accesskeyid,
                secretAccessKey: secretaccesskey,
                endpoint: accountid + ".r2.cloudflarestorage.com/" + destination,
        });

        function walkSync(currentDirPath, callback) {
            fs.readdirSync(currentDirPath).forEach(function (name) {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    console.log(filePath);
                    callback(filePath, stat);
                } else if (stat.isDirectory()) {
                    walkSync(filePath, callback);
                }
            });
        }

        function getLocalFileMD5(filePath) {
            return new Promise((resolve, reject) => {
                const hash = crypto.createHash('md5');
                const stream = fs.createReadStream(filePath);

                stream.on('data', (data) => hash.update(data));
                stream.on('end', () => resolve(hash.digest('hex')));
                stream.on('error', (err) => reject(err));
            });
        }

        function getS3ETag(bucketName, key) {
            return s3.headObject({ Bucket: bucketName, Key: key }).promise()
                .then(data => data.ETag.replace(/"/g, ''))
                .catch(err => {
                    if (err.code === 'NotFound') {
                        return null;
                    }
                    throw err;
                });
        }

        walkSync(s3Path, async function(filePath, stat) {
            let bucketPath = path.join(destination, filePath.substring(s3Path.length + 1));
            let localFileMD5 = await getLocalFileMD5(filePath);
            let s3ETag = await getS3ETag(bucketName, bucketPath);

            if (s3ETag === localFileMD5) {
                console.log(`Skipping upload for ${bucketPath}: File is unchanged.`);
            } else {
                console.log(`Successfully uploaded ${bucketPath} to ${bucketName}`);
                // let params = {
                //     Bucket: bucketName,
                //     Key: bucketPath,
                //     Body: fs.readFileSync(filePath),
                //     ContentType: mime.getType(filePath)
                // };
                // s3.putObject(params, function(err, data) {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         console.log(`Successfully uploaded ${bucketPath} to ${bucketName}`);
                //     }
                // });
            }
        });
    };
    
    uploadDir(source, bucket);
} catch (error) {
    core.setFailed(error.message);
}