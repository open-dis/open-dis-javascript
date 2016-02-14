/**
 * identify which of the optional data fields are contained in the Minefield Data PDU or requested in the Minefield Query PDU. This is a 32-bit record. For each field, true denotes that the data is requested or present and false denotes that the data is neither requested nor present. Section 6.2.16
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


null.DataFilterRecord = function()
{
   /** Bitflags field */
   this.bitFlags = 0;

  null.DataFilterRecord.prototype.initFromBinary = function(inputStream)
  {
       this.bitFlags = inputStream.readUInt();
  };

  null.DataFilterRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.bitFlags);
  };

/** boolean */
null.DataFilterRecord.prototype.getGroundBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x1;
   return val >> 0;
};


/** boolean */
null.DataFilterRecord.prototype.setGroundBurialDepthOffset= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x1; // Zero existing bits
  val = val << 0;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getWaterBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x2;
   return val >> 1;
};


/** boolean */
null.DataFilterRecord.prototype.setWaterBurialDepthOffset= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x2; // Zero existing bits
  val = val << 1;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getSnowBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x4;
   return val >> 2;
};


/** boolean */
null.DataFilterRecord.prototype.setSnowBurialDepthOffset= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x4; // Zero existing bits
  val = val << 2;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getMineOrientation = function()
{
   var val = this.bitFlags & 0x8;
   return val >> 3;
};


/** boolean */
null.DataFilterRecord.prototype.setMineOrientation= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x8; // Zero existing bits
  val = val << 3;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getThermalContrast = function()
{
   var val = this.bitFlags & 0x10;
   return val >> 4;
};


/** boolean */
null.DataFilterRecord.prototype.setThermalContrast= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x10; // Zero existing bits
  val = val << 4;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getReflectance = function()
{
   var val = this.bitFlags & 0x20;
   return val >> 5;
};


/** boolean */
null.DataFilterRecord.prototype.setReflectance= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x20; // Zero existing bits
  val = val << 5;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getMineEmplacementTime = function()
{
   var val = this.bitFlags & 0x40;
   return val >> 6;
};


/** boolean */
null.DataFilterRecord.prototype.setMineEmplacementTime= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x40; // Zero existing bits
  val = val << 6;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getTripDetonationWire = function()
{
   var val = this.bitFlags & 0x80;
   return val >> 7;
};


/** boolean */
null.DataFilterRecord.prototype.setTripDetonationWire= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x80; // Zero existing bits
  val = val << 7;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getFusing = function()
{
   var val = this.bitFlags & 0x100;
   return val >> 8;
};


/** boolean */
null.DataFilterRecord.prototype.setFusing= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x100; // Zero existing bits
  val = val << 8;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getScalarDetectionCoefficient = function()
{
   var val = this.bitFlags & 0x200;
   return val >> 9;
};


/** boolean */
null.DataFilterRecord.prototype.setScalarDetectionCoefficient= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x200; // Zero existing bits
  val = val << 9;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
null.DataFilterRecord.prototype.getPaintScheme = function()
{
   var val = this.bitFlags & 0x400;
   return val >> 10;
};


/** boolean */
null.DataFilterRecord.prototype.setPaintScheme= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0x400; // Zero existing bits
  val = val << 10;
  this.bitFlags = this.bitFlags | val; 
};


/** padding */
null.DataFilterRecord.prototype.getPadding = function()
{
   var val = this.bitFlags & 0xff800;
   return val >> 11;
};


/** padding */
null.DataFilterRecord.prototype.setPadding= function(val)
{
  var aVal = 0;
  this.bitFlags &= ~0xff800; // Zero existing bits
  val = val << 11;
  this.bitFlags = this.bitFlags | val; 
};

}; // end of class

 // node.js module support
exports.DataFilterRecord = null.DataFilterRecord;

// End of DataFilterRecord class

