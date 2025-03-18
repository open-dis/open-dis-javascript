/**
 * Section 5.3.12.13: A request for one or more records of data from an entity. COMPLETE
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
dis.RecordQueryReliablePdu = function()
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
   this.pduType = 65;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 10;

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
    * Object originatig the request
    * @type {EntityID}
    * @instance
    */
   this.originatingEntityID = new dis.EntityID(); 

   /**
    * Object with which this point object is associated
    * @type {EntityID}
    * @instance
    */
   this.receivingEntityID = new dis.EntityID(); 

   /**
    * request ID
    * @type {number}
    * @instance
    */
   this.requestID = 0;

   /**
    * level of reliability service used for this transaction
    * @type {number}
    * @instance
    */
   this.requiredReliabilityService = 0;

   /**
    * padding. The spec is unclear and contradictory here.
    * @type {number}
    * @instance
    */
   this.pad1 = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.pad2 = 0;

   /**
    * event type
    * @type {number}
    * @instance
    */
   this.eventType = 0;

   /**
    * time
    * @type {number}
    * @instance
    */
   this.time = 0;

   /**
    * numberOfRecords
    * @type {number}
    * @instance
    */
   this.numberOfRecords = 0;

   /**
    * record IDs
    * @type {Array<Chunk>}
    * @instance
    */
    this.recordIDs = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.RecordQueryReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.eventType = inputStream.readUShort();
       this.time = inputStream.readUInt();
       this.numberOfRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecords; idx++)
       {
           var anX = new dis.Chunk(4);
           anX.initFromBinary(inputStream);
           this.recordIDs.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.RecordQueryReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUShort(this.eventType);
       outputStream.writeUInt(this.time);
       outputStream.writeUInt(this.numberOfRecords);
       for(var idx = 0; idx < this.recordIDs.length; idx++)
       {
        this.recordIDs[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordQueryReliablePdu = dis.RecordQueryReliablePdu;

// End of RecordQueryReliablePdu class

