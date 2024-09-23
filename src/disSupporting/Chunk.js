if (typeof dis === "undefined")
   var dis = {};

// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

// Replaces (n)ByteChunk functions
// chunkSize: specify the size of the chunk, ie 1 = 1 byte chunk, 8 = 8 byte chunk, etc.
// usage: var foo = new Chunk(4) // for a 4 byte chunk
dis.Chunk = function(chunkSize, isSigned = true) {

	this.data = new Array(chunkSize).fill(0);
	this.chunkSize = chunkSize;
	this.isSigned = isSigned;

	dis.Chunk.prototype.initFromBinary = function(inputStream) {
		for(var i = 0; i < this.chunkSize; i++) {
			this.data[i] = this.isSigned ? inputStream.readByte() : inputStream.readUByte();
		}
	}
	dis.Chunk.prototype.encodeToBinary = function(outputStream) {
		for(var i = 0; i < this.chunkSize; i++) {
			this.isSigned ? outputStream.writeByte(this.data[i]) : outputStream.writeUByte(this.data[i]);
		}
	}
}

exports.Chunk = dis.Chunk;
