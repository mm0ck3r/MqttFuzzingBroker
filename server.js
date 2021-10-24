var mosca = require('mosca')
const Sinkdweller = require('sinkdweller')

let fuzzer = new Sinkdweller();

function sleep(ms){
	const wakeUpTime = Date.now() + ms;
	while(Date.now < wakeUpTime){}
}
var num = 0;
var settings = {
	port: 1883,
	persistence: mosca.persistence.Memory
};

var server = new mosca.Server(settings, function(){
	console.log('Mosca server is up and running')
});

server.clientConnected = function(client){
	console.log('Client connected : ',client.id);
}
idx = 0;
server.published = function(packet, client, cb){
	if(packet.topic.indexOf('test') === 0){
		console.log('ON PUBLISHED', packet.payload.toString(), 'on topic', packet.topic);
		return cb();
	}
	let packet_payload = new Buffer.from('김sdf3e성324진hello %n\t\b\no123!@#$漢字');
	let fuzzed_payload = fuzzer.fuzzSync(packet_payload);
	var newPacket = {
		topic: 'test/fuzz',
		payload: fuzzed_payload+' run check idx : '+String(idx),
		retain: undefined,
		qos: 0
	};
	console.log('newPacket', newPacket);
	server.publish(newPacket, cb);
	idx += 1;
}
