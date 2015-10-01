/**
 * An entity's associations with other entities and/or locations. For each association, this record shall specify the type of the association, the associated entity's EntityID and/or the associated location's world coordinates. This record may be used (optionally) in a transfer transaction to send internal state data from the divesting simulation to the acquiring simulation (see 5.9.4). This record may also be used for other purposes. Section 6.2.9
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


dis.Association = function()
{
   this.associationType = 0;

   this.padding4 = 0;

   /** identity of associated entity. If none, NO_SPECIFIC_ENTITY */
   this.associatedEntityID = new dis.EntityID(); 

   /** location, in world coordinates */
   this.associatedLocation = new dis.Vector3Double(); 

  dis.Association.prototype.initFromBinary = function(inputStream)
  {
       this.associationType = inputStream.readUByte();
       this.padding4 = inputStream.readUByte();
       this.associatedEntityID.initFromBinary(inputStream);
       this.associatedLocation.initFromBinary(inputStream);
  };

  dis.Association.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.associationType);
       outputStream.writeUByte(this.padding4);
       this.associatedEntityID.encodeToBinary(outputStream);
       this.associatedLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.Association = dis.Association;

// End of Association class

