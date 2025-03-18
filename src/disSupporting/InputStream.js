//var BigInteger = require('BigInteger');

if (typeof dis === "undefined")
   var dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

var Long = require('long');

/**
 * @constructor
 * @memberof dis
 * @param {ArrayBuffer} binaryData 
 */
dis.InputStream = function(binaryData)
{
    /**
     * data, byte offset
     * @type {DataView}
     * @instance
     */
    this.dataView = new DataView(binaryData, 0);
    
    /**
     * ptr to "current" position in array
     * @type {number}
     * @instance
     */
    this.currentPosition = 0; 

    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readUByte = function()
    {
        var data = this.dataView.getUint8(this.currentPosition);
        this.currentPosition = this.currentPosition + 1;
        return data;
    };

    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readByte = function()
    {
        var data = this.dataView.getInt8(this.currentPosition);
        this.currentPosition = this.currentPosition + 1;
        return data;
    };

    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readUShort = function()
    {
        var data = this.dataView.getUint16(this.currentPosition);
        this.currentPosition = this.currentPosition + 2;
        return data;
    };
    
    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readShort = function()
    {
        var data = this.dataView.getInt16(this.currentPosition);
        this.currentPosition = this.currentPosition + 2;
        return data;
    };
    
    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readUInt = function()
    {
        var data = this.dataView.getUint32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readInt = function()
    {
        var data = this.dataView.getInt32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    /** 
     * Read a long integer. Assumes big endian format. Uses the BigInteger package. 
     * @returns {number}
     */
    dis.InputStream.prototype.readLongInt = function()
    {
        var data1 = this.dataView.getInt32(this.currentPosition);
        var data2 = this.dataView.getInt32(this.currentPosition + 4);
        
        this.currentPosition = this.currentPosition + 8;
        
    };
   
    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readFloat32 = function()
    {
        var data = this.dataView.getFloat32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    /**
     * @returns {number}
     */
    dis.InputStream.prototype.readFloat64 = function()
    {
        var data = this.dataView.getFloat64(this.currentPosition);
        this.currentPosition = this.currentPosition + 8;
        return data;
    };

    /**
     * @returns {string}
     */
    dis.InputStream.prototype.readLong = function()
    {
	    var high = this.dataView.getInt32(this.currentPosition);
	    var low = this.dataView.getInt32(this.currentPosition + 4);
	    var long = new Long(low, high);
	    return long.toString();
    };
};

exports.InputStream = dis.InputStream;
