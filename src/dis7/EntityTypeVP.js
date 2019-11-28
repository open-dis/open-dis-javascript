/**
 * Association or disassociation of two entities.  Section 6.2.94.5
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


dis.EntityTypeVP = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 3;

   /** Indicates if this VP has changed since last issuance */
   this.changeIndicator = 0;

   /**  */
   this.entityType = new dis.EntityType(); 

   /** padding */
   this.padding = 0;

   /** padding */
   this.padding1 = 0;

  dis.EntityTypeVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.entityType.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.padding1 = inputStream.readUInt();
  };

  dis.EntityTypeVP.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       this.entityType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeUInt(this.padding1);
  };
}; // end of class

 // node.js module support
exports.EntityTypeVP = dis.EntityTypeVP;

// End of EntityTypeVP class

