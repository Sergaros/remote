const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = Promise;
//mongoose.set('debug', true);

mongoose.connect(config.get('mongoose.uri'), config.get('mongoose.options'));

mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

module.exports = mongoose;
