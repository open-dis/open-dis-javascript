/**
 * Section 5.2.40. Information about a geometry, a state associated with a geometry, a bounding volume, or an associated entity ID. NOTE: this class requires hand coding.
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
dis.Environment = function()
{
   /**
    * Record type
    * @type {number}
    * @instance
    */
   this.environmentType = 0;

   /**
    * length, in bits
    * @type {number}
    * @instance
    */
   this.length = 0;

   /**
    * Identify the sequentially numbered record index
    * @type {number}
    * @instance
    */
   this.recordIndex = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * Geometry or state record
    * @type {number}
    * @instance
    */
   this.geometry = 0;

   /**
    * padding to bring the total size up to a 64 bit boundry
    * @type {number}
    * @instance
    */
   this.padding2 = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.Environment.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUByte();
       this.recordIndex = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.geometry = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.Environment.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUByte(this.length);
       outputStream.writeUByte(this.recordIndex);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUByte(this.geometry);
       outputStream.writeUByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.Environment = dis.Environment;

// End of Environment class

