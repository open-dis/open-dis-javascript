/**
 * Section 7.5.8. response to an action request PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.ActionResponsePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 17;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new null.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new null.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new null.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new null.EntityID(); 

   /** Request ID that is unique */
   this.requestID = 0;

   /** Status of response */
   this.requestStatus = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  null.ActionResponsePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requestStatus = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new null.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new null.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  null.ActionResponsePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.requestStatus);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ActionResponsePdu = null.ActionResponsePdu;

// End of ActionResponsePdu class

