/**
 * used to convey entity and conflict status information associated with transferring ownership of an entity. Section 6.2.65
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


dis.OwnershipStatus = function()
{
   /** EntityID */
   this.entityId = new dis.EntityID(); 

   /** The ownership and/or ownership conflict status of the entity represented by the Entity ID field. */
   this.ownershipStatus = 0;

   /** padding */
   this.padding = 0;

  dis.OwnershipStatus.prototype.initFromBinary = function(inputStream)
  {
       this.entityId.initFromBinary(inputStream);
       this.ownershipStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.OwnershipStatus.prototype.encodeToBinary = function(outputStream)
  {
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUByte(this.ownershipStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.OwnershipStatus = dis.OwnershipStatus;

// End of OwnershipStatus class

