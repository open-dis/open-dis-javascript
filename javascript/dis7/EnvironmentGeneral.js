/**
 *  Information about a geometry, a state associated with a geometry, a bounding volume, or an associated entity ID. NOTE: this class requires hand coding. 6.2.31
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


dis.EnvironmentGeneral = function()
{
   /** Record type */
   this.environmentType = 0;

   /** length, in bits */
   this.length = 0;

   /** Identify the sequentially numbered record index */
   this.index = 0;

   /** padding */
   this.padding1 = 0;

   /** Geometry or state record */
   this.geometry = 0;

   /** padding to bring the total size up to a 64 bit boundry */
   this.padding2 = 0;

  dis.EnvironmentGeneral.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUByte();
       this.index = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.geometry = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
  };

  dis.EnvironmentGeneral.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUByte(this.length);
       outputStream.writeUByte(this.index);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUByte(this.geometry);
       outputStream.writeUByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.EnvironmentGeneral = dis.EnvironmentGeneral;

// End of EnvironmentGeneral class

