if (typeof dis === "undefined")
   dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/**
 * @param binaryDataBuffer ArrayBuffer
*/
dis.OutputStream = function(binaryDataBuffer)
{
    this.binaryData = binaryDataBuffer;
    this.dataView = new DataView(this.binaryData); // data, byte offset
    this.currentPosition = 0;                    // ptr to current position in array
    
    dis.OutputStream.prototype.writeUByte = function(userData)
    {   
        this.dataView.setUint8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    dis.OutputStream.prototype.writeByte = function(userData)
    {
        this.dataView.setInt8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    dis.OutputStream.prototype.writeUShort = function(userData)
    {
        this.dataView.setUint16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };
    
    dis.OutputStream.prototype.writeShort = function(userData)
    {
        this.dataView.setInt16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };
    
    dis.OutputStream.prototype.writeUInt = function(userData)
    {
        this.dataView.setUint32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
    
    dis.OutputStream.prototype.writeInt = function(userData)
    {
        this.dataView.setInt32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
   
    dis.OutputStream.prototype.writeFloat32 = function(userData)
    {
        this.dataView.setFloat32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
    
    dis.OutputStream.prototype.writeFloat64 = function(userData)
    {
        this.dataView.setFloat64(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 8;
    };
    
    dis.OutputStream.prototype.writeLong = function(userData)
    {
        console.log("Problem in dis.outputStream. Javascript cannot natively handle 64 bit ints");
        console.log("writing 0, which is almost certainly wrong");
        this.dataView.setInt32(this.currentPosition, 0);
        this.dataView.setInt32(this.currentPosition + 4, 0);
        this.currentPosition = this.currentPosition + 8;
    };
};

exports.OutputStream = dis.OutputStream;
