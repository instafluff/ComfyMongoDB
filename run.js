#!/usr/bin/env node

// Run a self-contained MongoDB using ComfyMongoDB
const ComfyMongo = require( "./" )();
ComfyMongo.on( "output", ( data ) => {
    // console.log( data );
});
ComfyMongo.on( "error", ( err ) => {
    console.log( err );
});
ComfyMongo.on( "ready", async () => {
    console.log( "[ComfyMongoDB] Ready..." );
});
ComfyMongo.on( "exit", ( code ) => {
    console.log( "[ComfyMongoDB] Exit:", code );
});
