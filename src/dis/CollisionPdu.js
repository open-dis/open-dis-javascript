/**
 * Section 5.3.3.2. Information about a collision. COMPLETE
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
dis.CollisionPdu = function()
{
   /**
    * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
    * @type {number}
    * @instance
    */
   this.protocolVersion = 6;

   /**
    * Exercise ID
    * @type {number}
    * @instance
    */
   this.exerciseID = 0;

   /**
    * Type of pdu, unique for each PDU class
    * @type {number}
    * @instance
    */
   this.pduType = 4;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 1;

   /**
    * Timestamp value
    * @type {number}
    * @instance
    */
   this.timestamp = 0;

   /**
    * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
    * @type {number}
    * @instance
    */
   this.pduLength = 0;

   /**
    * zero-filled array of padding
    * @type {number}
    * @instance
    */
   this.padding = 0;

   /**
    * ID of the entity that issued the collision PDU
    * @type {EntityID}
    * @instance
    */
   this.issuingEntityID = new dis.EntityID(); 

   /**
    * ID of entity that has collided with the issuing entity ID
    * @type {EntityID}
    * @instance
    */
   this.collidingEntityID = new dis.EntityID(); 

   /**
    * ID of event
    * @type {EventID}
    * @instance
    */
   this.eventID = new dis.EventID(); 

   /**
    * ID of event
    * @type {EventID}
    * @instance
    */
   this.collisionType = 0;

   /**
    * some padding
    * @type {number}
    * @instance
    */
   this.pad = 0;

   /**
    * velocity at collision
    * @type {Vector3Float}
    * @instance
    */
   this.velocity = new dis.Vector3Float(); 

   /**
    * mass of issuing entity
    * @type {number}
    * @instance
    */
   this.mass = 0;

   /**
    * Location with respect to entity the issuing entity collided with
    * @type {Vector3Float}
    * @instance
    */
   this.location = new dis.Vector3Float(); 

  /**
   * @param {InputStream} inputStream
   */
  dis.CollisionPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.issuingEntityID.initFromBinary(inputStream);
       this.collidingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.collisionType = inputStream.readUByte();
       this.pad = inputStream.readByte();
       this.velocity.initFromBinary(inputStream);
       this.mass = inputStream.readFloat32();
       this.location.initFromBinary(inputStream);
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.CollisionPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.issuingEntityID.encodeToBinary(outputStream);
       this.collidingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.collisionType);
       outputStream.writeByte(this.pad);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.mass);
       this.location.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.CollisionPdu = dis.CollisionPdu;

// End of CollisionPdu class

