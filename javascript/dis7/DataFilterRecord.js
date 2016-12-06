/**
 * identify which of the optional data fields are contained in the Minefield Data PDU or requested in the Minefield Query PDU. This is a 32-bit record. For each field, true denotes that the data is requested or present and false denotes that the data is neither requested nor present. Section 6.2.16
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


dis.DataFilterRecord = function()
{
   /** Bitflags field */
   this.bitFlags = 0;

  dis.DataFilterRecord.prototype.initFromBinary = function(inputStream)
  {
       this.bitFlags = inputStream.readUInt();
  };

  dis.DataFilterRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.bitFlags);
  };

/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_groundBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x1;
   return val >> 0;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_groundBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x1; // Zero existing bits
  val = val << 0;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_waterBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x2;
   return val >> 1;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_waterBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x2; // Zero existing bits
  val = val << 1;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_snowBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x4;
   return val >> 2;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_snowBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x4; // Zero existing bits
  val = val << 2;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_mineOrientation = function()
{
   var val = this.bitFlags & 0x8;
   return val >> 3;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_mineOrientation= function(val)
{
  this.bitFlags &= ~0x8; // Zero existing bits
  val = val << 3;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_thermalContrast = function()
{
   var val = this.bitFlags & 0x10;
   return val >> 4;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_thermalContrast= function(val)
{
  this.bitFlags &= ~0x10; // Zero existing bits
  val = val << 4;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_reflectance = function()
{
   var val = this.bitFlags & 0x20;
   return val >> 5;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_reflectance= function(val)
{
  this.bitFlags &= ~0x20; // Zero existing bits
  val = val << 5;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_mineEmplacementTime = function()
{
   var val = this.bitFlags & 0x40;
   return val >> 6;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_mineEmplacementTime= function(val)
{
  this.bitFlags &= ~0x40; // Zero existing bits
  val = val << 6;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_tripDetonationWire = function()
{
   var val = this.bitFlags & 0x80;
   return val >> 7;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_tripDetonationWire= function(val)
{
  this.bitFlags &= ~0x80; // Zero existing bits
  val = val << 7;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_fusing = function()
{
   var val = this.bitFlags & 0x100;
   return val >> 8;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_fusing= function(val)
{
  this.bitFlags &= ~0x100; // Zero existing bits
  val = val << 8;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_scalarDetectionCoefficient = function()
{
   var val = this.bitFlags & 0x200;
   return val >> 9;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_scalarDetectionCoefficient= function(val)
{
  this.bitFlags &= ~0x200; // Zero existing bits
  val = val << 9;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis.DataFilterRecord.prototype.getBitFlags_paintScheme = function()
{
   var val = this.bitFlags & 0x400;
   return val >> 10;
};


/** boolean */
dis.DataFilterRecord.prototype.setBitFlags_paintScheme= function(val)
{
  this.bitFlags &= ~0x400; // Zero existing bits
  val = val << 10;
  this.bitFlags = this.bitFlags | val; 
};


/** padding */
dis.DataFilterRecord.prototype.getBitFlags_padding = function()
{
   var val = this.bitFlags & 0xff800;
   return val >> 11;
};


/** padding */
dis.DataFilterRecord.prototype.setBitFlags_padding= function(val)
{
  this.bitFlags &= ~0xff800; // Zero existing bits
  val = val << 11;
  this.bitFlags = this.bitFlags | val; 
};

}; // end of class

 // node.js module support
exports.DataFilterRecord = dis.DataFilterRecord;

// End of DataFilterRecord class

