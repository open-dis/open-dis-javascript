/**
 * Detonation or impact of munitions, as well as, non-munition explosions, the burst or initial bloom of chaff, and the ignition of a flare shall be indicated. Section 7.3.3  COMPLETE
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


dis.DetonationPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 3;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** ID of the expendable entity, Section 7.3.3  */
   this.explodingEntityID = new dis.EntityID(); 

   /** ID of event, Section 7.3.3 */
   this.eventID = new dis.EventIdentifier(); 

   /** velocity of the munition immediately before detonation/impact, Section 7.3.3  */
   this.velocity = new dis.Vector3Float(); 

   /** location of the munition detonation, the expendable detonation, Section 7.3.3  */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /** Describes the detonation represented, Section 7.3.3  */
   this.descriptor = new dis.MunitionDescriptor(); 

   /** Velocity of the ammunition, Section 7.3.3  */
   this.locationOfEntityCoordinates = new dis.Vector3Float(); 

   /** result of the detonation, Section 7.3.3  */
   this.detonationResult = 0;

   /** How many articulation parameters we have, Section 7.3.3  */
   this.numberOfVariableParameters = 0;

   /** padding */
   this.pad = 0;

   /** specify the parameter values for each Variable Parameter record, Section 7.3.3  */
    this.variableParameters = new Array();
 
  dis.DetonationPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.explodingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.descriptor.initFromBinary(inputStream);
       this.locationOfEntityCoordinates.initFromBinary(inputStream);
       this.detonationResult = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readUByte();
       this.pad = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.DetonationPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.explodingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.descriptor.encodeToBinary(outputStream);
       this.locationOfEntityCoordinates.encodeToBinary(outputStream);
       outputStream.writeUByte(this.detonationResult);
       outputStream.writeUByte(this.numberOfVariableParameters);
       outputStream.writeUShort(this.pad);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
        this.variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DetonationPdu = dis.DetonationPdu;

// End of DetonationPdu class

