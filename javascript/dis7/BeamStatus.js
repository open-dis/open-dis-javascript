/**
 * Information related to the status of a beam. This is contained in the beam status field of the electromagnitec emission PDU. The first bit determines whether the beam is active (0) or deactivated (1). Section 6.2.12.
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


null.BeamStatus = function()
{
   /** First bit zero means beam is active, first bit = 1 means deactivated. The rest is padding. */
   this.beamState = 0;

  null.BeamStatus.prototype.initFromBinary = function(inputStream)
  {
       this.beamState = inputStream.readUByte();
  };

  null.BeamStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamState);
  };

/** 0 active, 1 deactivated */
null.BeamStatus.prototype.getBeamState = function()
{
   var val = this.beamState & 0x1;
   return val >> 0;
};


/** 0 active, 1 deactivated */
null.BeamStatus.prototype.setBeamState= function(val)
{
  var aVal = 0;
  this.beamState &= ~0x1; // Zero existing bits
  val = val << 0;
  this.beamState = this.beamState | val; 
};


/** padding */
null.BeamStatus.prototype.getPadding = function()
{
   var val = this.beamState & 0xFE;
   return val >> 1;
};


/** padding */
null.BeamStatus.prototype.setPadding= function(val)
{
  var aVal = 0;
  this.beamState &= ~0xFE; // Zero existing bits
  val = val << 1;
  this.beamState = this.beamState | val; 
};

}; // end of class

 // node.js module support
exports.BeamStatus = null.BeamStatus;

// End of BeamStatus class

