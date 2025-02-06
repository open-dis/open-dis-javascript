/**
 * Section 5.3.3.1. Represents the postion and state of one entity in the world. This is identical in function to entity state pdu, but generates less garbage to collect in the Java world. COMPLETE
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
dis.FastEntityStatePdu = function()
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
   this.pduType = 1;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 1;

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
    * The site ID
    * @type {number}
    * @instance
    */
   this.site = 0;

   /**
    * The application ID
    * @type {number}
    * @instance
    */
   this.application = 0;

   /**
    * the entity ID
    * @type {number}
    * @instance
    */
   this.entity = 0;

   /**
    * what force this entity is affiliated with, eg red, blue, neutral, etc
    * @type {number}
    * @instance
    */
   this.forceId = 0;

   /**
    * How many articulation parameters are in the variable length list
    * @type {number}
    * @instance
    */
   this.numberOfArticulationParameters = 0;

   /**
    * Kind of entity
    * @type {number}
    * @instance
    */
   this.entityKind = 0;

   /**
    * Domain of entity (air, surface, subsurface, space, etc)
    * @type {number}
    * @instance
    */
   this.domain = 0;

   /**
    * country to which the design of the entity is attributed
    * @type {number}
    * @instance
    */
   this.country = 0;

   /**
    * category of entity
    * @type {number}
    * @instance
    */
   this.category = 0;

   /**
    * subcategory of entity
    * @type {number}
    * @instance
    */
   this.subcategory = 0;

   /**
    * specific info based on subcategory field. Name changed from specific because that is a reserved word in SQL.
    * @type {number}
    * @instance
    */
   this.specif = 0;

   /**
    * @type {number}
    * @instance
    */
   this.extra = 0;

   /**
    * Kind of entity
    * @type {number}
    * @instance
    */
   this.altEntityKind = 0;

   /**
    * Domain of entity (air, surface, subsurface, space, etc)
    * @type {number}
    * @instance
    */
   this.altDomain = 0;

   /**
    * country to which the design of the entity is attributed
    * @type {number}
    * @instance
    */
   this.altCountry = 0;

   /**
    * category of entity
    * @type {number}
    * @instance
    */
   this.altCategory = 0;

   /**
    * subcategory of entity
    * @type {number}
    * @instance
    */
   this.altSubcategory = 0;

   /**
    * specific info based on subcategory field
    * @type {number}
    * @instance
    */
   this.altSpecific = 0;

   /**
    * @type {number}
    * @instance
    */
   this.altExtra = 0;

   /**
    * X velo
    * @type {number}
    * @instance
    */
   this.xVelocity = 0;

   /**
    * y Value
    * @type {number}
    * @instance
    */
   this.yVelocity = 0;

   /**
    * Z value
    * @type {number}
    * @instance
    */
   this.zVelocity = 0;

   /**
    * X value
    * @type {number}
    * @instance
    */
   this.xLocation = 0;

   /**
    * y Value
    * @type {number}
    * @instance
    */
   this.yLocation = 0;

   /**
    * Z value
    * @type {number}
    * @instance
    */
   this.zLocation = 0;

   /**
    * @type {number}
    * @instance
    */
   this.psi = 0;

   /**
    * @type {number}
    * @instance
    */
   this.theta = 0;

   /**
    * @type {number}
    * @instance
    */
   this.phi = 0;

   /**
    * a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc.
    * @type {number}
    * @instance
    */
   this.entityAppearance = 0;

   /**
    * enumeration of what dead reckoning algorighm to use
    * @type {number}
    * @instance
    */
   this.deadReckoningAlgorithm = 0;

   /**
    * other parameters to use in the dead reckoning algorithm
    * @type {Array<number>}
    * @instance
    */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /**
    * X value
    * @type {number}
    * @instance
    */
   this.xAcceleration = 0;

   /**
    * y Value
    * @type {number}
    * @instance
    */
   this.yAcceleration = 0;

   /**
    * Z value
    * @type {number}
    * @instance
    */
   this.zAcceleration = 0;

   /**
    * X value
    * @type {number}
    * @instance
    */
   this.xAngularVelocity = 0;

   /**
    * y Value
    * @type {number}
    * @instance
    */
   this.yAngularVelocity = 0;

   /**
    * Z value
    * @type {number}
    * @instance
    */
   this.zAngularVelocity = 0;

   /**
    * characters that can be used for debugging, or to draw unique strings on the side of entities in the world
    * @type {Array<number>}
    * @instance
    */
   this.marking = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /**
    * a series of bit flags
    * @type {number}
    * @instance
    */
   this.capabilities = 0;

   /**
    * variable length list of articulation parameters
    * @type {Array<ArticulationParameter>}
    * @instance
    */
    this.articulationParameters = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.FastEntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.entity = inputStream.readUShort();
       this.forceId = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readByte();
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specif = inputStream.readUByte();
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
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.FastEntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.entity);
       outputStream.writeUByte(this.forceId);
       outputStream.writeByte(this.numberOfArticulationParameters);
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specif);
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
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
         this.articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 
 * @returns {number} 0 uniform color, 1 camouflage 
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/** 
 * @param {number} val 0 uniform color, 1 camouflage  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 no mobility kill, 1 mobility kill  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/** 
 * @param {number} val 0 no mobility kill, 1 mobility kill  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 no firepower iill, 1 firepower kill  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/** 
 * @param {number} val 0 no firepower iill, 1 firepower kill  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 no damage, 1 slight damage, 2 moderate, 3 destroyed  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/** 
 * @param {number} val 0 no damage, 1 slight damage, 2 moderate, 3 destroyed  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/** 
 * @param {number} val 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @param {number} val dust cloud, 0 none 1 small 2 medium 3 large  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/** 
 * @param {number} val dust cloud, 0 none 1 small 2 medium 3 large  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/** 
 * @param {number} val 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 off 1 on
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/** 
 * @param {number} val 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/** 
 * @param {number} val 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/** 
 * @param {number} val 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/** 
 * @param {number} val 0 off 1 on  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 not raised 1 raised  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/** 
 * @param {number} val 0 not raised 1 raised  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 
 * @returns {number} 0 desert 1 winter 2 forest 3 unused  
 */
dis.FastEntityStatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/** 
 * @param {number} val 0 desert 1 winter 2 forest 3 unused  
 */
dis.FastEntityStatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.FastEntityStatePdu = dis.FastEntityStatePdu;

// End of FastEntityStatePdu class

