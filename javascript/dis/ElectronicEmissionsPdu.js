/**
 * Section 5.3.7.1. Information about active electronic warfare (EW) emissions and active EW countermeasures shall be communicated using an Electromagnetic Emission PDU. COMPLETE (I think)
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


dis.ElectronicEmissionsPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 23;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity emitting */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventID(); 

   /** This field shall be used to indicate if the data in the PDU represents a state update or just data that has changed since issuance of the last Electromagnetic Emission PDU [relative to the identified entity and emission system(s)]. */
   this.stateUpdateIndicator = 0;

   /** This field shall specify the number of emission systems being described in the current PDU. */
   this.numberOfSystems = 0;

   /** padding */
   this.paddingForEmissionsPdu = 0;

   /** Electronic emmissions systems */
    this.systems = new Array();
 
  dis.ElectronicEmissionsPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateUpdateIndicator = inputStream.readUByte();
       this.numberOfSystems = inputStream.readUByte();
       this.paddingForEmissionsPdu = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfSystems; idx++)
       {
           var anX = new dis.ElectronicEmissionSystemData();
           anX.initFromBinary(inputStream);
           this.systems.push(anX);
       }

  };

  dis.ElectronicEmissionsPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.stateUpdateIndicator);
       outputStream.writeUByte(this.numberOfSystems);
       outputStream.writeUShort(this.paddingForEmissionsPdu);
       for(var idx = 0; idx < this.systems.length; idx++)
       {
        this.systems[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionsPdu = dis.ElectronicEmissionsPdu;

// End of ElectronicEmissionsPdu class

