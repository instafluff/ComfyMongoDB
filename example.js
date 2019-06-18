const mongo = require( "./index" )(); // Note: Normally this would be "comfy-mongo"

mongo.on( "output", ( data ) => {
	// console.log( "Output:", data );
});

mongo.on( "error", ( err ) => {
	console.log( "Error:", err );
});

mongo.on( "exit", ( code ) => {
	console.log( "Exit:", code );
});

mongo.on( "ready", async () => {
	console.log( "Ready!" );

	const MongoClient = require('mongodb').MongoClient;
	const assert = require('assert');

	// Connection URL
	const url = "mongodb://localhost:27017";
	const dbName = "myproject";

	// Use connect method to connect to the Server
	MongoClient.connect( url, { useNewUrlParser: true }, ( err, client ) => {
		assert.equal( null, err );
		console.log("Connected successfully to server");

		const db = client.db( dbName );

		insertDocuments( db, ( result ) => {
			console.log( result );
			client.close();
		});
	});

	function insertDocuments( db, callback ) {
		// Get the documents collection
		const collection = db.collection('documents');
		// Insert some documents
		collection.insertMany([
			{a : 1}, {a : 2}, {a : 3}
		], ( err, result ) => {
			assert.equal( err, null );
			assert.equal( 3, result.result.n );
			assert.equal( 3, result.ops.length );
			console.log( "Inserted 3 documents into the collection" );
			callback( result );
		});
	}
});
