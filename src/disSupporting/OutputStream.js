if (typeof dis === "undefined")
   var dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

var Long = require('long');

/**
 * @constructor
 * @memberof dis
 * @param {ArrayBuffer} binaryDataBuffer
 */
dis.OutputStream = function(binaryDataBuffer)
{
    /**
     * @type {ArrayBuffer}
     * @instance
     */
    this.binaryData = binaryDataBuffer;

    /**
     * data, byte offset
     * @type {DataView}
     * @instance
     */
    this.dataView = new DataView(this.binaryData);
    
    /**
     * ptr to current position in array
     * @type {number}
     * @instance
     */
    this.currentPosition = 0;
    
    /**
     * Returns a byte array trimmed to the maximum number of bytes written
     * to the stream. Eg, if we initialize with a 500 byte bufer, and we
     * only write 10 bytes to the output stream, this will return the first
     * ten bytes of the array.
     * 
     * @returns {ArrayBuffer} Only the data written
     */
    dis.OutputStream.prototype.toByteArray = function()
    {
        var trimmedData = this.binaryData.slice(0, this.currentPosition); 
        return trimmedData;
    };
    
    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeUByte = function(userData)
    {   
        this.dataView.setUint8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeByte = function(userData)
    {
        this.dataView.setInt8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeUShort = function(userData)
    {
        this.dataView.setUint16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };
    
    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeShort = function(userData)
    {
        this.dataView.setInt16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };

    /**
     * @param {number} userData 
     */    
    dis.OutputStream.prototype.writeUInt = function(userData)
    {
        this.dataView.setUint32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };

    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeInt = function(userData)
    {
        this.dataView.setInt32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };

    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeFloat32 = function(userData)
    {
        this.dataView.setFloat32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };

    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeFloat64 = function(userData)
    {
        this.dataView.setFloat64(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 8;
    };

    /**
     * @param {number} userData 
     */
    dis.OutputStream.prototype.writeLong = function(userData)
    {
	var long = new Long.fromString(userData);
	this.dataView.setInt32(this.currentPosition, long.getHighBits());
	this.dataView.setInt32(this.currentPosition + 4, long.getLowBits());
	this.currentPosition = this.currentPosition + 8;
    };
};

exports.OutputStream = dis.OutputStream;
