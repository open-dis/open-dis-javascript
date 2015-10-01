/**
 * 5.2.58. Used in IFF ATC PDU
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


dis.SystemID = function()
{
   /** System Type */
   this.systemType = 0;

   /** System name, an enumeration */
   this.systemName = 0;

   /** System mode */
   this.systemMode = 0;

   /** Change Options */
   this.changeOptions = 0;

  dis.SystemID.prototype.initFromBinary = function(inputStream)
  {
       this.systemType = inputStream.readUShort();
       this.systemName = inputStream.readUShort();
       this.systemMode = inputStream.readUByte();
       this.changeOptions = inputStream.readUByte();
  };

  dis.SystemID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.systemType);
       outputStream.writeUShort(this.systemName);
       outputStream.writeUByte(this.systemMode);
       outputStream.writeUByte(this.changeOptions);
  };
}; // end of class

 // node.js module support
exports.SystemID = dis.SystemID;

// End of SystemID class

