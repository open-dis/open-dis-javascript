/**
 * Record sets, used in transfer control request PDU
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.RecordSet = function()
{
   /**
    * record ID
    * @type {number}
    * @instance
    */
   this.recordID = 0;

   /**
    * record set serial number
    * @type {number}
    * @instance
    */
   this.recordSetSerialNumber = 0;

   /**
    * record length
    * @type {number}
    * @instance
    */
   this.recordLength = 0;

   /**
    * record count
    * @type {number}
    * @instance
    */
   this.recordCount = 0;

   /**
    *  ^^^This is wrong--variable sized data records
    * @type {number}
    * @instance
    */
   this.recordValues = 0;

   /**
    *  ^^^This is wrong--variable sized padding
    * @type {number}
    * @instance
    */
   this.pad4 = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.RecordSet.prototype.initFromBinary = function(inputStream)
  {
       this.recordID = inputStream.readUInt();
       this.recordSetSerialNumber = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordCount = inputStream.readUShort();
       this.recordValues = inputStream.readUShort();
       this.pad4 = inputStream.readUByte();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.RecordSet.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordID);
       outputStream.writeUInt(this.recordSetSerialNumber);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.recordCount);
       outputStream.writeUShort(this.recordValues);
       outputStream.writeUByte(this.pad4);
  };
}; // end of class

 // node.js module support
exports.RecordSet = dis.RecordSet;

// End of RecordSet class

