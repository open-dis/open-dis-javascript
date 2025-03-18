/**
 * Section 5.3.12.14: Initializing or changing internal parameter info. Needs manual intervention     to fix padding in recrod set PDUs. UNFINISHED
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
dis.SetRecordReliablePdu = function()
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
   this.pduType = 64;

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
    * Number of record sets in list
    * @type {number}
    * @instance
    */
   this.numberOfRecordSets = 0;

   /**
    * record sets
    * @type {Array<RecordSet>}
    * @instance
    */
    this.recordSets = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.SetRecordReliablePdu.prototype.initFromBinary = function(inputStream)
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
       this.numberOfRecordSets = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis.RecordSet();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.SetRecordReliablePdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUInt(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
        this.recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SetRecordReliablePdu = dis.SetRecordReliablePdu;

// End of SetRecordReliablePdu class

