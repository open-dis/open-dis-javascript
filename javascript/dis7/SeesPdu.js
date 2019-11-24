/**
 *  SEES PDU, supplemental emissions entity state information. Section 7.6.6 COMPLETE
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


dis.SeesPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 30;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Originating entity ID */
   this.orginatingEntityID = new dis.EntityID(); 

   /** IR Signature representation index */
   this.infraredSignatureRepresentationIndex = 0;

   /** acoustic Signature representation index */
   this.acousticSignatureRepresentationIndex = 0;

   /** radar cross section representation index */
   this.radarCrossSectionSignatureRepresentationIndex = 0;

   /** how many propulsion systems */
   this.numberOfPropulsionSystems = 0;

   /** how many vectoring nozzle systems */
   this.numberOfVectoringNozzleSystems = 0;

   /** variable length list of propulsion system data */
    this.propulsionSystemData = new Array();
 
   /** variable length list of vectoring system data */
    this.vectoringSystemData = new Array();
 
  dis.SeesPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.infraredSignatureRepresentationIndex = inputStream.readUShort();
       this.acousticSignatureRepresentationIndex = inputStream.readUShort();
       this.radarCrossSectionSignatureRepresentationIndex = inputStream.readUShort();
       this.numberOfPropulsionSystems = inputStream.readUShort();
       this.numberOfVectoringNozzleSystems = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfPropulsionSystems; idx++)
       {
           var anX = new dis.PropulsionSystemData();
           anX.initFromBinary(inputStream);
           this.propulsionSystemData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVectoringNozzleSystems; idx++)
       {
           var anX = new dis.VectoringNozzleSystem();
           anX.initFromBinary(inputStream);
           this.vectoringSystemData.push(anX);
       }

  };

  dis.SeesPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.infraredSignatureRepresentationIndex);
       outputStream.writeUShort(this.acousticSignatureRepresentationIndex);
       outputStream.writeUShort(this.radarCrossSectionSignatureRepresentationIndex);
       outputStream.writeUShort(this.numberOfPropulsionSystems);
       outputStream.writeUShort(this.numberOfVectoringNozzleSystems);
       for(var idx = 0; idx < this.propulsionSystemData.length; idx++)
       {
        this.propulsionSystemData[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.vectoringSystemData.length; idx++)
       {
        this.vectoringSystemData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SeesPdu = dis.SeesPdu;

// End of SeesPdu class

