/**
 * 5.3.3.4. Nonstatic information about a particular entity may be communicated by issuing an Entity State Update PDU. COMPLETE
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
dis.EntityStateUpdatePdu = function()
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
   this.pduType = 67;

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
    * This field shall identify the entity issuing the PDU
    * @type {EntityID}
    * @instance
    */
   this.entityID = new dis.EntityID(); 

   /**
    * Padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * How many articulation parameters are in the variable length list
    * @type {number}
    * @instance
    */
   this.numberOfArticulationParameters = 0;

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
    * @type {Array<ArticulationParameter>}
    * @instance
    */
   this.articulationParameters = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.EntityStateUpdatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readByte();
       this.numberOfArticulationParameters = inputStream.readUByte();
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readInt();
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
  dis.EntityStateUpdatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeByte(this.padding1);
       outputStream.writeUByte(this.numberOfArticulationParameters);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeInt(this.entityAppearance);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
        this.articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 0 uniform color, 1 camouflage */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/** 0 uniform color, 1 camouflage */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 not raised 1 raised */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/** 0 not raised 1 raised */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.EntityStateUpdatePdu = dis.EntityStateUpdatePdu;

// End of EntityStateUpdatePdu class

