/**
 * Section 5.3.6.12. Arbitrary messages can be entered into the data stream via use of this PDU. COMPLETE
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
dis.CommentPdu = function()
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
   this.pduType = 22;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 5;

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
    *  Entity that is sending message
    * @type {EntityID}
    * @instance
    */
   this.originatingEntityID = new dis.EntityID(); 

   /**
    *  Entity that is intended to receive message
    * @type {EntityID}
    * @instance
    */
   this.receivingEntityID = new dis.EntityID(); 

   /**
    * Number of fixed datum records
    * @type {number}
    * @instance
    */
   this.numberOfFixedDatumRecords = 0;

   /**
    * Number of variable datum records
    * @type {number}
    * @instance
    */
   this.numberOfVariableDatumRecords = 0;

   /**
    * variable length list of fixed datums
    * @type {Array<FixedDatum>}
    * @instance
    */
    this.fixedDatums = new Array();
 
   /**
    * variable length list of variable length datums
    * @type {Array<VariableDatum>}
    * @instance
    */
    this.variableDatums = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.CommentPdu.prototype.initFromBinary = function(inputStream)
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
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.CommentPdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
        this.fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
        this.variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.CommentPdu = dis.CommentPdu;

// End of CommentPdu class

