const fs = require('fs');
const kill = require('tree-kill');
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
			// mongoPath = __dirname + "/node_modules/.bin/mongo-win";
			break;
		case "darwin": // OSX
			mongoPath = __dirname + "/mongodb/mac/mongod";
			// mongoPath = __dirname + "/node_modules/.bin/mongo-mac";
			break;
		case "linux": // Linux
			mongoPath = __dirname + "/mongodb/linux/mongod";
			// mongoPath = __dirname + "/node_modules/.bin/mongo-linux";
			break;
		default:
			throw new Error( "Unsupported Platform: " + process.platform );
	}

	let mongoProc = spawn( mongoPath, [ "-dbpath", dataDir ], {
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
		mongo.emit( "close", code );
	});

	mongoProc.on( "exit", ( code ) => {
		mongo.emit( "exit", code );
	});

	mongo.shutdown = () => {
		if( mongoProc ) {
			kill( mongoProc.pid );
			mongoProc = null;
		}
	};

	process.on( "beforeExit", mongo.shutdown );
	process.on( "SIGINT", mongo.shutdown );
	process.on( "SIGTERM", mongo.shutdown );
	process.on( "SIGBREAK", mongo.shutdown );
	process.on( "SIGHUP", mongo.shutdown );
	process.on( "uncaughtException", mongo.shutdown );

	return mongo;
}
