const fs = require('fs');
const spawn = require("child_process").spawn;
const EventEmitter = require('events');
class ComfyMongo extends EventEmitter {};

module.exports = function( dataDir = "./data" ) {
	try {
		fs.mkdirSync( "data", { recursive: true } );
	}
	catch( err ) {
		if( err.code !== 'EEXIST' ) throw err;
	}

	const mongo = new ComfyMongo();

	var mongoPath = "";
	switch( process.platform ) {
		case "win32": // Windows
			mongoPath = __dirname + "\\mongodb\\win\\mongod.exe";
			break;
		case "darwin": // OSX
			mongoPath = __dirname + "/mongodb/mac/mongod";
			break;
		case "linux": // Linux
			mongoPath = __dirname + "/mongodb/linux/mongod";
			break;
		default:
			throw new Error( "Unsupported Platform: " + process.platform );
	}

	const mongoProc = spawn( mongoPath, [ "-dbpath", dataDir ], {
		shell: true
	});

	mongoProc.stdout.on( "data", ( data ) => {
		mongo.emit( "output", data.toString( "utf8" ) );
		if( data.includes( "waiting for connections on" ) ) {
			mongo.emit( "ready" );
		}
	});

	mongoProc.stderr.on( "data", ( data ) => {
		mongo.emit( "error", data.toString( "utf8" ) );
	});

	mongoProc.on( "close", ( code ) => {
		mongo.emit( "exit", code );
	});

	process.on( "SIGINT", () => mongoProc.kill( "SIGINT" ) );
	process.on( "exit", () => mongoProc.kill( "SIGINT" ) );

	return mongo;
}
