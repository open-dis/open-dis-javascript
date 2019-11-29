if (typeof dis === "undefined")
   dis = {};

// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

// Replaces (n)ByteChunk functions
// chunkSize: specify the size of the chunk, ie 1 = 1 byte chunk, 8 = 8 byte chunk, etc.
// usage: var foo = new Chunk(4) // for a 4 byte chunk
dis.Chunk = function(chunkSize) {

	data = new Array(chunkSize).fill(0);
	chunkSize = chunkSize;

	dis.Chunk.prototype.initFromBinaryDIS = function(inputStream) {
		for(var i = 0; i < this.chunkSize; i++) {
			this.data[i] = inputStream.readByte();
		}
	}
	dis.Chunk.prototype.encodeToBinaryDIS = function(outputStream) {
		for(var i = 0; i < this.chunkSize; i++) {
			outputStream.writeByte(this.data[i]);
		}
	}
}

exports.Chunk = dis.Chunk;
