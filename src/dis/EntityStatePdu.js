/**
 * Section 5.3.3.1. Represents the postion and state of one entity in the world. COMPLETE
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
dis.EntityStatePdu = function()
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
    * Unique ID for an entity that is tied to this state information
    * @type {EntityID}
    * @instance
    */
   this.entityID = new dis.EntityID(); 

   /**
    * What force this entity is affiliated with, eg red, blue, neutral, etc
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
    * Describes the type of entity in the world
    * @type {EntityType}
    * @instance
    */
   this.entityType = new dis.EntityType(); 

   /**
    * @type {EntityType}
    * @instance
    */
   this.alternativeEntityType = new dis.EntityType(); 

   /**
    * Describes the speed of the entity in the world
    * @type {Vector3Float}
    * @instance
    */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /**
    * describes the location of the entity in the world
    * @type {Vector3Double}
    * @instance
    */
   this.entityLocation = new dis.Vector3Double(); 

   /**
    * describes the orientation of the entity, in euler angles
    * @type {Orientation}
    * @instance
    */
   this.entityOrientation = new dis.Orientation(); 

   /**
    * a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc.
    * @type {number}
    * @instance
    */
   this.entityAppearance = 0;

   /**
    * parameters used for dead reckoning
    * @type {DeadReckoningParameter}
    * @instance
    */
   this.deadReckoningParameters = new dis.DeadReckoningParameter(); 

   /**
    * characters that can be used for debugging, or to draw unique strings on the side of entities in the world
    * @type {Marking}
    * @instance
    */
   this.marking = new dis.Marking(); 

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
  dis.EntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityID.initFromBinary(inputStream);
       this.forceId = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readByte();
       this.entityType.initFromBinary(inputStream);
       this.alternativeEntityType.initFromBinary(inputStream);
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readInt();
       this.deadReckoningParameters.initFromBinary(inputStream);
       this.marking.initFromBinary(inputStream);
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
  dis.EntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceId);
       outputStream.writeByte(this.numberOfArticulationParameters);
       this.entityType.encodeToBinary(outputStream);
       this.alternativeEntityType.encodeToBinary(outputStream);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeInt(this.entityAppearance);
       this.deadReckoningParameters.encodeToBinary(outputStream);
       this.marking.encodeToBinary(outputStream);
       outputStream.writeInt(this.capabilities);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           this.articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/**
 * @returns {number} 0 uniform color, 1 camouflage
 */
dis.EntityStatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/**
 * @param {number} val 0 uniform color, 1 camouflage
 */
dis.EntityStatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 no mobility kill, 1 mobility kill
 */
dis.EntityStatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/**
 * @param {number} val 0 no mobility kill, 1 mobility kill
 */
dis.EntityStatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 no firepower iill, 1 firepower kill
 */
dis.EntityStatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/**
 * @param {number} val 0 no firepower iill, 1 firepower kill
 */
dis.EntityStatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
 */
dis.EntityStatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/**
 * @param {number} val 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
 */
dis.EntityStatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
 */
dis.EntityStatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/**
 * @param {number} val 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
 */
dis.EntityStatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} dust cloud, 0 none 1 small 2 medium 3 large
 */
dis.EntityStatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/**
 * @param {number} val dust cloud, 0 none 1 small 2 medium 3 large
 */
dis.EntityStatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
 */
dis.EntityStatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/**
 * @param {number} val 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
 */
dis.EntityStatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 off 1 on
 */
dis.EntityStatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/**
 * @param {number} val 0 off 1 on
 */
dis.EntityStatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 off 1 on
 */
dis.EntityStatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/**
 * @param {number} val 0 off 1 on
 */
dis.EntityStatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 off 1 on
 */
dis.EntityStatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/**
 * @param {number} val 0 off 1 on
 */
dis.EntityStatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 off 1 on
 */
dis.EntityStatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/**
 * @param {number} val 0 off 1 on
 */
dis.EntityStatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 not raised 1 raised
 */
dis.EntityStatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/**
 * @param {number} val 0 not raised 1 raised
 */
dis.EntityStatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/**
 * @returns {number} 0 desert 1 winter 2 forest 3 unused
 */
dis.EntityStatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/**
 * @param {number} val 0 desert 1 winter 2 forest 3 unused
 */
dis.EntityStatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.EntityStatePdu = dis.EntityStatePdu;

// End of EntityStatePdu class

