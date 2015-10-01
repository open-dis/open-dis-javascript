/**
 * 5.3.3.4. Nonstatic information about a particular entity may be communicated by issuing an Entity State Update PDU. COMPLETE
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


dis.EntityStateUpdatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 67;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the entity issuing the PDU */
   this.entityID = new dis.EntityID(); 

   /** Padding */
   this.padding1 = 0;

   /** How many articulation parameters are in the variable length list */
   this.numberOfArticulationParameters = 0;

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new dis.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new dis.Orientation(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

    this.articulationParameters = new Array();
 
  dis.EntityStateUpdatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readByte();
       this.numberOfArticulationParameters = inputStream.readUByte();
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  dis.EntityStateUpdatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeByte(this.padding1);
       outputStream.writeUByte(this.numberOfArticulationParameters);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeInt(this.entityAppearance);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           articulationParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EntityStateUpdatePdu = dis.EntityStateUpdatePdu;

// End of EntityStateUpdatePdu class

