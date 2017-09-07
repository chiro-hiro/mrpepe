'mode strict';
const dgram = require('dgram');
const cluster = require('cluster');

//Default configuration
const PEPE_DEFAULT_HOST = '0.0.0.0';
const PEPE_DEFAULT_PORT = 1988;
const PEPE_DEFAULT_PROTOCOL = 'udp4';
const PEPE_DEFAULT_CHILD_PROCESS = 2;


//Convert Buffer to JSON
function BufferToJSON(buf) {
    if (Buffer.isBuffer(buf)) {
        try {
            return JSON.parse(buf.toString());
        }
        catch (err) {
            throw err;
        }
    } else {
        throw new TypeError("Buffer input only");
    }
}

//Convert JSON to Buffer
function JSONToBuffer(json) {
    try {
        return new Buffer(JSON.stringify(json));
    }
    catch (err) {
        throw err;
    }
}

//Mr Epep (Mr Pepe client)
function epep(config) {
    let _self = this;

    //Merge config
    for (let i in config) {
        this.config[i] = config[i];
    }

    //Call method
    this.call = (method, params, callback) => {
        let client = dgram.createSocket(this.config.protocol);
        let dataBuffer = JSONToBuffer({ method: method, params: params });
        client.send(dataBuffer, 0, dataBuffer.length, _self.config.port, _self.config.address, (err) => {
            if (err) {
                console.log(err);
                client.close();
            }
        });
        client.on('error', (error) => {
            callback(error, null, null);
            client.close();
        });
        client.on('message', (data, rinfo) => {
            callback(null, data, rinfo);
            client.close();
        });
    }
    return this;
}

//Mr Epep configuration
epep.prototype.config = {
    port: PEPE_DEFAULT_PORT,
    address: PEPE_DEFAULT_HOST,
    protocol: PEPE_DEFAULT_PROTOCOL
}

//Mr Pepe
function pepe(config, obj) {
    let _self = this;

    //Merge config
    for (let i in config) {
        this.config[i] = config[i];
    }

    this._onError = this.config.onError;
    this._server = dgram.createSocket(this.config.protocol);
    this._object = obj;

    this.start = () => {
        if (cluster.isMaster) {
            for (let i = 0; i < _self.config.child; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died with code ${code} signal ${signal}`);
            });
        } else {
            //Setup error callback
            _self._server.on('error', err => {
                if (err) {
                    console.log('Error', err);
                    _self._server.close();
                }
            });

            //Method binding
            _self._server.on('message', (data, rinfo) => {
                let jsonData = BufferToJSON(data);
                let dataBuffer;
                let el = null;
                for(let i in jsonData.params){
                    el = jsonData.params[i];
                    if(typeof(el.type) === 'string'){
                        if(el.type === 'Buffer'){
                            jsonData.params[i] = new Buffer(el);
                        }
                    }
                }
                try {
                    dataBuffer = JSONToBuffer({ success: true, data: this._object[jsonData.method].apply(null, jsonData.params) });
                }
                catch (err) {
                    dataBuffer = JSONToBuffer({ success: false, data: err.message });
                }
                _self._server.send(dataBuffer, 0, dataBuffer.length, rinfo.port, rinfo.address, _self._onError);
            });

            //Start up
            _self._server.bind(_self.config.port, _self.config.address);
        }
    }

    return this;
}

//Mr Pepe configuration
pepe.prototype.config = {
    port: PEPE_DEFAULT_PORT,
    address: PEPE_DEFAULT_HOST,
    protocol: PEPE_DEFAULT_PROTOCOL,
    child: PEPE_DEFAULT_CHILD_PROCESS
}

//Export global module
module.exports.server = pepe;
module.exports.client = epep;