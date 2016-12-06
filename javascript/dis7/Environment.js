/**
 * Incomplete environment record; requires hand coding to fix. Section 6.2.31.1
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


dis.Environment = function()
{
   /** type */
   this.environmentType = 0;

   /** length, in bits, of the record */
   this.length = 0;

   /** identifies the sequntially numbered record index */
   this.index = 0;

   /** padding */
   this.padding = 0;

  dis.Environment.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.index = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Environment.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.index);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Environment = dis.Environment;

// End of Environment class

