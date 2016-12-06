/**
 * Association or disassociation of two entities.  Section 6.2.94.4.3
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


dis.EntityAssociation = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 4;

   /** Indicates if this VP has changed since last issuance */
   this.changeIndicator = 0;

   /** Indicates association status between two entities; 8 bit enum */
   this.associationStatus = 0;

   /** Type of association; 8 bit enum */
   this.associationType = 0;

   /** Object ID of entity associated with this entity */
   this.entityID = new dis.EntityID(); 

   /** Station location on one's own entity. EBV doc. */
   this.ownStationLocation = 0;

   /** Type of physical connection. EBV doc */
   this.physicalConnectionType = 0;

   /** Type of member the entity is within th egroup */
   this.groupMemberType = 0;

   /** Group if any to which the entity belongs */
   this.groupNumber = 0;

  dis.EntityAssociation.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.associationStatus = inputStream.readUByte();
       this.associationType = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.ownStationLocation = inputStream.readUShort();
       this.physicalConnectionType = inputStream.readUByte();
       this.groupMemberType = inputStream.readUByte();
       this.groupNumber = inputStream.readUShort();
  };

  dis.EntityAssociation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUByte(this.associationStatus);
       outputStream.writeUByte(this.associationType);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.ownStationLocation);
       outputStream.writeUByte(this.physicalConnectionType);
       outputStream.writeUByte(this.groupMemberType);
       outputStream.writeUShort(this.groupNumber);
  };
}; // end of class

 // node.js module support
exports.EntityAssociation = dis.EntityAssociation;

// End of EntityAssociation class

