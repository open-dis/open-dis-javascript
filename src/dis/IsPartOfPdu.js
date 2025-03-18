/**
 * Section 5.3.9.4 The joining of two or more simulation entities is communicated by this PDU. COMPLETE
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
dis.IsPartOfPdu = function()
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
   this.pduType = 36;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 7;

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
    * ID of entity originating PDU
    * @type {EntityID}
    * @instance
    */
   this.orginatingEntityID = new dis.EntityID(); 

   /**
    * ID of entity receiving PDU
    * @type {EntityID}
    * @instance
    */
   this.receivingEntityID = new dis.EntityID(); 

   /**
    * relationship of joined parts
    * @type {Relationship}
    * @instance
    */
   this.relationship = new dis.Relationship(); 

   /**
    * location of part; centroid of part in host's coordinate system. x=range, y=bearing, z=0
    * @type {Vector3Float}
    * @instance
    */
   this.partLocation = new dis.Vector3Float(); 

   /**
    * named location
    * @type {NamedLocation}
    * @instance
    */
   this.namedLocationID = new dis.NamedLocation(); 

   /**
    * entity type
    * @type {EntityType}
    * @instance
    */
   this.partEntityType = new dis.EntityType(); 

  /**
   * @param {InputStream} inputStream
   */
  dis.IsPartOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.relationship.initFromBinary(inputStream);
       this.partLocation.initFromBinary(inputStream);
       this.namedLocationID.initFromBinary(inputStream);
       this.partEntityType.initFromBinary(inputStream);
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.IsPartOfPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.relationship.encodeToBinary(outputStream);
       this.partLocation.encodeToBinary(outputStream);
       this.namedLocationID.encodeToBinary(outputStream);
       this.partEntityType.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IsPartOfPdu = dis.IsPartOfPdu;

// End of IsPartOfPdu class

