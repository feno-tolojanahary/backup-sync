const { spawn } = require("child_process");
// dump database
// upload data to an S3
// schedule backup
// remove old backup
// take one in each backup
// next
// tool to upload an s3 file into an another region

const CONFIG = {
    dbName: ""
}

const INNER_CONF = {
    outFolder: ""
}

class Manager {

    async dumMongodb () {
        return new Promise((resolve, reject) => {
            const dump = spawn('mongodump', ["--db", CONFIG.dbName, "-o", INNER_CONF.outFolder])
            dump.stdout.on("data", (data) => {
                resolve(data)
            })
            dump.stderr.on("data", (err) => {
                reject(err)
            })
            dump.on("close", (code) => {
                if (code !== 0) {
                    console.log(`exited with code: ${code}`);
                    reject(new Error(`exited with code: ${code}`))
                }
                reject("done")
            })
        })
    }
    
    
}

module.exports = Manager;