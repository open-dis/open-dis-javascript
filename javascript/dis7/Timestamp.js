/**
 * LSB is absolute or relative timestamp. Scale is 2^31 - 1 divided into one hour.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Timestamp = function()
{
   /** timestamp */
   this.timestamp = 0;

  dis.Timestamp.prototype.initFromBinary = function(inputStream)
  {
       this.timestamp = inputStream.readUInt();
  };

  dis.Timestamp.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.timestamp);
  };

/** 0 relative timestamp, 1 host synchronized timestamp */
dis.Timestamp.prototype.getTimestamp_timestampType = function()
{
   var val = this.timestamp & 0x1;
   return val >> 0;
};


/** 0 relative timestamp, 1 host synchronized timestamp */
dis.Timestamp.prototype.setTimestamp_timestampType= function(val)
{
  this.timestamp &= ~0x1; // Zero existing bits
  val = val << 0;
  this.timestamp = this.timestamp | val; 
};


/** 2^31-1 per hour time units */
dis.Timestamp.prototype.getTimestamp_timestampValue = function()
{
   var val = this.timestamp & 0xFE;
   return val >> 1;
};


/** 2^31-1 per hour time units */
dis.Timestamp.prototype.setTimestamp_timestampValue= function(val)
{
  this.timestamp &= ~0xFE; // Zero existing bits
  val = val << 1;
  this.timestamp = this.timestamp | val; 
};

}; // end of class

 // node.js module support
exports.Timestamp = dis.Timestamp;

// End of Timestamp class

