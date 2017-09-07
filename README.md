<p align="center">
    <a href="https://www.npmjs.com/package/pepe">
        <img src="https://raw.githubusercontent.com/tad88dev/content/master/pepe/mr-pepe.jpg">
    </a>
</p>

# Mr. Pepe
Mr. Pepe provide protocol to work with remote object over UDP.

# How to create Mr. Pepe server?
```javascript
const mrPepe = require('pepe');
const crypto = require('crypto');

var localObject = {
    sha256: (data) => {
        return crypto.createHash('sha256').update(data).digest().toString('hex');
    },
    sum: (a, b) => {
        return a+b;
    }
};

var server = new mrPepe.server({
    address: '127.0.0.1',
    port: 3301,
    protocol: 'udp4',
    child: 4
}, localObject);

server.start();
```

This source code create a service binding to port 3301 with 4 child process. All method of `localObject` will be provide as res API. Of couse Mr. Pepe support UDP/IPv4 and UDP/IPv6.

# How to create Mr. Pepe client?
```javascript
const mrPepe = require('pepe');

var client = new mrPepe.client({
    address: '127.0.0.1',
    port: 3301,
    protocol: 'udp4',
});

client.call('sha256', [new Buffer('Chiro may cry!.')], (error, data, rinfo) => {
    console.log(`Error: ${error}\nData: ${data}\nFrom: ${rinfo.address}:${rinfo.port}.`);
});

client.call('sum', [4,5], (error, data, rinfo) => {
    console.log(`Error: ${error}\nData: ${data}\nFrom: ${rinfo.address}:${rinfo.port}.`);
});
```
This source code create UDP datagram connect to server following configuration. It'll trigger `localObject` over UPD.

# Future works
- Support callback function
- Parsing parameters in `Buffer` type

# License
This software distributed under [MIT License](https://github.com/tad88dev/pepe/blob/master/LICENSE)
