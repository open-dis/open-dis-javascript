/**
 * Section 5.3.12.11: reports the occurance of a significatnt event to the simulation manager. Needs manual     intervention to fix padding in variable datums. UNFINISHED.
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
dis.EventReportReliablePdu = function()
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
   this.pduType = 61;

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
    * Event type
    * @type {number}
    * @instance
    */
   this.eventType = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.pad1 = 0;

   /**
    * Fixed datum record count
    * @type {number}
    * @instance
    */
   this.numberOfFixedDatumRecords = 0;

   /**
    * variable datum record count
    * @type {number}
    * @instance
    */
   this.numberOfVariableDatumRecords = 0;

   /**
    * Fixed datum records
    * @type {Array<FixedDatum>}
    * @instance
    */
    this.fixedDatumRecords = new Array();
 
   /**
    * Variable datum records
    * @type {Array<VariableDatum>}
    * @instance
    */
    this.variableDatumRecords = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.EventReportReliablePdu.prototype.initFromBinary = function(inputStream)
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
       this.eventType = inputStream.readUShort();
       this.pad1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.EventReportReliablePdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUShort(this.eventType);
       outputStream.writeUInt(this.pad1);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
        this.fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
        this.variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EventReportReliablePdu = dis.EventReportReliablePdu;

// End of EventReportReliablePdu class

