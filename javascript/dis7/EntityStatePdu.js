/**
 * Represents the postion and state of one entity in the world. Section 7.2.2. COMPLETE
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


null.EntityStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 1;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Unique ID for an entity that is tied to this state information */
   this.entityID = new null.EntityID(); 

   /** What force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceId = 0;

   /** How many variable parameters are in the variable length list. In earlier versions of DIS these were known as articulation parameters */
   this.numberOfVariableParameters = 0;

   /** Describes the type of entity in the world */
   this.entityType = new null.EntityType(); 

   this.alternativeEntityType = new null.EntityType(); 

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new null.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new null.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new null.EulerAngles(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** parameters used for dead reckoning */
   this.deadReckoningParameters = new null.DeadReckoningParameters(); 

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new null.EntityMarking(); 

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of variable parameters. In earlier DIS versions this was articulation parameters. */
    this.variableParameters = new Array();
 
  null.EntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.forceId = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readUByte();
       this.entityType.initFromBinary(inputStream);
       this.alternativeEntityType.initFromBinary(inputStream);
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readUInt();
       this.deadReckoningParameters.initFromBinary(inputStream);
       this.marking.initFromBinary(inputStream);
       this.capabilities = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new null.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  null.EntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceId);
       outputStream.writeUByte(this.numberOfVariableParameters);
       this.entityType.encodeToBinary(outputStream);
       this.alternativeEntityType.encodeToBinary(outputStream);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeUInt(this.entityAppearance);
       this.deadReckoningParameters.encodeToBinary(outputStream);
       this.marking.encodeToBinary(outputStream);
       outputStream.writeUInt(this.capabilities);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
           variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EntityStatePdu = null.EntityStatePdu;

// End of EntityStatePdu class

