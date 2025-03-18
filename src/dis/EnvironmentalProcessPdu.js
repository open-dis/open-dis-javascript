/**
 * Section 5.3.11.1: Information about environmental effects and processes. This requires manual cleanup. the environmental        record is variable, as is the padding. UNFINISHED
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
dis.EnvironmentalProcessPdu = function()
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
   this.pduType = 41;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 9;

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
    *  Environmental process ID
    * @type {EntityID}
    * @instance
    */
   this.environementalProcessID = new dis.EntityID(); 

   /**
    * Environment type
    * @type {EntityType}
    * @instance
    */
   this.environmentType = new dis.EntityType(); 

   /**
    * model type
    * @type {number}
    * @instance
    */
   this.modelType = 0;

   /**
    * Environment status
    * @type {number}
    * @instance
    */
   this.environmentStatus = 0;

   /**
    * number of environment records
    * @type {number}
    * @instance
    */
   this.numberOfEnvironmentRecords = 0;

   /**
    * PDU sequence number for the environmentla process if pdu sequencing required
    * @type {number}
    * @instance
    */
   this.sequenceNumber = 0;

   /**
    * environemt records
    * @type {Array<Environment>}
    * @instance
    */
    this.environmentRecords = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.EnvironmentalProcessPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.environementalProcessID.initFromBinary(inputStream);
       this.environmentType.initFromBinary(inputStream);
       this.modelType = inputStream.readUByte();
       this.environmentStatus = inputStream.readUByte();
       this.numberOfEnvironmentRecords = inputStream.readUByte();
       this.sequenceNumber = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfEnvironmentRecords; idx++)
       {
           var anX = new dis.Environment();
           anX.initFromBinary(inputStream);
           this.environmentRecords.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.EnvironmentalProcessPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.environementalProcessID.encodeToBinary(outputStream);
       this.environmentType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.modelType);
       outputStream.writeUByte(this.environmentStatus);
       outputStream.writeUByte(this.numberOfEnvironmentRecords);
       outputStream.writeUShort(this.sequenceNumber);
       for(var idx = 0; idx < this.environmentRecords.length; idx++)
       {
        this.environmentRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EnvironmentalProcessPdu = dis.EnvironmentalProcessPdu;

// End of EnvironmentalProcessPdu class

