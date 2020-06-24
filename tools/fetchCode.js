const https = require('https');
const yaml = require('js-yaml');
const fs = require('fs');

let fileContents = fs.readFileSync('./env.yaml', 'utf8');
let env = yaml.safeLoad(fileContents);

var email = env.screeps.email,
    password = env.screeps.password,
    data = {
        branch: "Rev8",
        ptr: env.screeps.ptr,
    };

const reqOptions = {
    hostname: 'screeps.com',
    port: 443,
    path: '/api/user/code',
    query: data,
    method: 'GET',
    auth: email + ':' + password,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
};

var req = https.get(reqOptions, (res) => {
        let data = "";
        res.on('data', function(chunk) {
                data+=chunk;
        });
        res.on("end", () => {
            try {
                let json = JSON.parse(data);

                for(let moduleName in json.modules){
                    let folder = "";
                    let fileName = "";
                    let nameComponents = moduleName.split('_');
                    if(nameComponents.length > 1){
                        folder = nameComponents.shift()+'/';
                        fileName = nameComponents.join('_');
                    } else {
                        fileName = moduleName;
                    }
                    let targetDir = './src/'+folder;
                    if (!fs.existsSync(targetDir)){
                        fs.mkdirSync(targetDir);
                    }

                    fs.writeFileSync(targetDir+'/'+fileName+'.js', json.modules[moduleName]);
                }
            } catch (error) {
                console.error(error.message);
            }
        });
    });

req.end();