/**
 * Section 5.3.10.3 Information about individual mines within a minefield. This is very, very wrong. UNFINISHED
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


dis.MinefieldDataPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 39;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.EntityID(); 

   /** ID of entity making request */
   this.requestingEntityID = new dis.EntityID(); 

   /** Minefield sequence number */
   this.minefieldSequenceNumbeer = 0;

   /** request ID */
   this.requestID = 0;

   /** pdu sequence number */
   this.pduSequenceNumber = 0;

   /** number of pdus in response */
   this.numberOfPdus = 0;

   /** how many mines are in this PDU */
   this.numberOfMinesInThisPdu = 0;

   /** how many sensor type are in this PDU */
   this.numberOfSensorTypes = 0;

   /** padding */
   this.pad2 = 0;

   /** 32 boolean fields */
   this.dataFilter = 0;

   /** Mine type */
   this.mineType = new dis.EntityType(); 

   /** Sensor types, each 16 bits long */
    this.sensorTypes = new Array();
 
   /** Padding to get things 32-bit aligned. ^^^this is wrong--dyanmically sized padding needed */
   this.pad3 = 0;

   /** Mine locations */
    this.mineLocation = new Array();
 
  dis.MinefieldDataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.minefieldID.initFromBinary(inputStream);
       this.requestingEntityID.initFromBinary(inputStream);
       this.minefieldSequenceNumbeer = inputStream.readUShort();
       this.requestID = inputStream.readUByte();
       this.pduSequenceNumber = inputStream.readUByte();
       this.numberOfPdus = inputStream.readUByte();
       this.numberOfMinesInThisPdu = inputStream.readUByte();
       this.numberOfSensorTypes = inputStream.readUByte();
       this.pad2 = inputStream.readUByte();
       this.dataFilter = inputStream.readUInt();
       this.mineType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfSensorTypes; idx++)
       {
           var anX = new dis.Chunk(2);
           anX.initFromBinary(inputStream);
           this.sensorTypes.push(anX);
       }

       this.pad3 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfMinesInThisPdu; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.mineLocation.push(anX);
       }

  };

  dis.MinefieldDataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       this.requestingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldSequenceNumbeer);
       outputStream.writeUByte(this.requestID);
       outputStream.writeUByte(this.pduSequenceNumber);
       outputStream.writeUByte(this.numberOfPdus);
       outputStream.writeUByte(this.numberOfMinesInThisPdu);
       outputStream.writeUByte(this.numberOfSensorTypes);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.dataFilter);
       this.mineType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.sensorTypes.length; idx++)
       {
        this.sensorTypes[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUByte(this.pad3);
       for(var idx = 0; idx < this.mineLocation.length; idx++)
       {
        this.mineLocation[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldDataPdu = dis.MinefieldDataPdu;

// End of MinefieldDataPdu class

