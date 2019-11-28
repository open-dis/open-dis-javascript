/**
 * Represents the postion and state of one entity in the world. This is identical in function to entity state pdu, but generates less garbage to collect in the Java world. Section 7.2.2. COMPLETE
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


dis.FastEntityStatePdu = function()
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

   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the entity ID */
   this.entity = 0;

   /** what force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceId = 0;

   /** How many variable (nee articulation) parameters are in the variable length list */
   this.numberOfVariableParameters = 0;

   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field */
   this.specific = 0;

   this.extra = 0;

   /** Kind of entity */
   this.altEntityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.altDomain = 0;

   /** country to which the design of the entity is attributed */
   this.altCountry = 0;

   /** category of entity */
   this.altCategory = 0;

   /** subcategory of entity */
   this.altSubcategory = 0;

   /** specific info based on subcategory field */
   this.altSpecific = 0;

   this.altExtra = 0;

   /** X velo */
   this.xVelocity = 0;

   /** y Value */
   this.yVelocity = 0;

   /** Z value */
   this.zVelocity = 0;

   /** X value */
   this.xLocation = 0;

   /** y Value */
   this.yLocation = 0;

   /** Z value */
   this.zLocation = 0;

   this.psi = 0;

   this.theta = 0;

   this.phi = 0;

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** enumeration of what dead reckoning algorighm to use */
   this.deadReckoningAlgorithm = 0;

   /** other parameters to use in the dead reckoning algorithm */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** X value */
   this.xAcceleration = 0;

   /** y Value */
   this.yAcceleration = 0;

   /** Z value */
   this.zAcceleration = 0;

   /** X value */
   this.xAngularVelocity = 0;

   /** y Value */
   this.yAngularVelocity = 0;

   /** Z value */
   this.zAngularVelocity = 0;

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of variable parameters. In earlier versions of DIS these were known as articulation parameters */
    this.variableParameters = new Array();
 
  dis.FastEntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.entity = inputStream.readUShort();
       this.forceId = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readByte();
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
       this.altEntityKind = inputStream.readUByte();
       this.altDomain = inputStream.readUByte();
       this.altCountry = inputStream.readUShort();
       this.altCategory = inputStream.readUByte();
       this.altSubcategory = inputStream.readUByte();
       this.altSpecific = inputStream.readUByte();
       this.altExtra = inputStream.readUByte();
       this.xVelocity = inputStream.readFloat32();
       this.yVelocity = inputStream.readFloat32();
       this.zVelocity = inputStream.readFloat32();
       this.xLocation = inputStream.readFloat64();
       this.yLocation = inputStream.readFloat64();
       this.zLocation = inputStream.readFloat64();
       this.psi = inputStream.readFloat32();
       this.theta = inputStream.readFloat32();
       this.phi = inputStream.readFloat32();
       this.entityAppearance = inputStream.readInt();
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
       this.xAcceleration = inputStream.readFloat32();
       this.yAcceleration = inputStream.readFloat32();
       this.zAcceleration = inputStream.readFloat32();
       this.xAngularVelocity = inputStream.readFloat32();
       this.yAngularVelocity = inputStream.readFloat32();
       this.zAngularVelocity = inputStream.readFloat32();
       for(var idx = 0; idx < 12; idx++)
       {
          this.marking[ idx ] = inputStream.readByte();
       }
       this.capabilities = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.FastEntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.entity);
       outputStream.writeUByte(this.forceId);
       outputStream.writeByte(this.numberOfVariableParameters);
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
       outputStream.writeUByte(this.altEntityKind);
       outputStream.writeUByte(this.altDomain);
       outputStream.writeUShort(this.altCountry);
       outputStream.writeUByte(this.altCategory);
       outputStream.writeUByte(this.altSubcategory);
       outputStream.writeUByte(this.altSpecific);
       outputStream.writeUByte(this.altExtra);
       outputStream.writeFloat32(this.xVelocity);
       outputStream.writeFloat32(this.yVelocity);
       outputStream.writeFloat32(this.zVelocity);
       outputStream.writeFloat64(this.xLocation);
       outputStream.writeFloat64(this.yLocation);
       outputStream.writeFloat64(this.zLocation);
       outputStream.writeFloat32(this.psi);
       outputStream.writeFloat32(this.theta);
       outputStream.writeFloat32(this.phi);
       outputStream.writeInt(this.entityAppearance);
       outputStream.writeUByte(this.deadReckoningAlgorithm);
       for(var idx = 0; idx < 15; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
       outputStream.writeFloat32(this.xAcceleration);
       outputStream.writeFloat32(this.yAcceleration);
       outputStream.writeFloat32(this.zAcceleration);
       outputStream.writeFloat32(this.xAngularVelocity);
       outputStream.writeFloat32(this.yAngularVelocity);
       outputStream.writeFloat32(this.zAngularVelocity);
       for(var idx = 0; idx < 12; idx++)
       {
          outputStream.writeByte(this.marking[ idx ] );
       }
       outputStream.writeInt(this.capabilities);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
         this.variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.FastEntityStatePdu = dis.FastEntityStatePdu;

// End of FastEntityStatePdu class

