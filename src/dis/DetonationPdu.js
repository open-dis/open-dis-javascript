/**
 * Section 5.3.4.2. Information about stuff exploding. COMPLETE
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
dis.DetonationPdu = function()
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
   this.pduType = 3;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 2;

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
    * ID of the entity that shot
    * @type {EntityID}
    * @instance
    */
   this.firingEntityID = new dis.EntityID(); 

   /**
    * ID of the entity that is being shot at
    * @type {EntityID}
    * @instance
    */
   this.targetEntityID = new dis.EntityID(); 

   /**
    * ID of muntion that was fired
    * @type {EntityID}
    * @instance
    */
   this.munitionID = new dis.EntityID(); 

   /**
    * ID firing event
    * @type {EventID}
    * @instance
    */
   this.eventID = new dis.EventID(); 

   /**
    * ID firing event
    * @type {Vector3Float}
    * @instance
    */
   this.velocity = new dis.Vector3Float(); 

   /**
    * where the detonation is, in world coordinates
    * @type {Vector3Double}
    * @instance
    */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /**
    * Describes munition used
    * @type {BurstDescriptor}
    * @instance
    */
   this.burstDescriptor = new dis.BurstDescriptor(); 

   /**
    * location of the detonation or impact in the target entity's coordinate system. This information should be used for damage assessment.
    * @type {Vector3Float}
    * @instance
    */
   this.locationInEntityCoordinates = new dis.Vector3Float(); 

   /**
    * result of the explosion
    * @type {number}
    * @instance
    */
   this.detonationResult = 0;

   /**
    * How many articulation parameters we have
    * @type {number}
    * @instance
    */
   this.numberOfArticulationParameters = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.pad = 0;

   /**
    * @type {Array<ArticulationParameter>}
    * @instance
    */
   this.articulationParameters = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.DetonationPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.burstDescriptor.initFromBinary(inputStream);
       this.locationInEntityCoordinates.initFromBinary(inputStream);
       this.detonationResult = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readUByte();
       this.pad = inputStream.readShort();
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.DetonationPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.burstDescriptor.encodeToBinary(outputStream);
       this.locationInEntityCoordinates.encodeToBinary(outputStream);
       outputStream.writeUByte(this.detonationResult);
       outputStream.writeUByte(this.numberOfArticulationParameters);
       outputStream.writeShort(this.pad);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
        this.articulationParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DetonationPdu = dis.DetonationPdu;

// End of DetonationPdu class

