/**
 * Section 5.2.4.2. Used when the antenna pattern type field has a value of 1. Specifies           the direction, patter, and polarization of radiation from an antenna.
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


dis.BeamAntennaPattern = function()
{
   /** The rotation that transformst he reference coordinate sytem     into the beam coordinate system. Either world coordinates or entity coordinates may be used as the     reference coordinate system, as specified by teh reference system field of the antenna pattern record. */
   this.beamDirection = new dis.Orientation(); 

   this.azimuthBeamwidth = 0;

   this.elevationBeamwidth = 0;

   this.referenceSystem = 0;

   this.padding1 = 0;

   this.padding2 = 0;

   /** Magnigute of the z-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna. */
   this.ez = 0;

   /** Magnigute of the x-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna. */
   this.ex = 0;

   /** THe phase angle between Ez and Ex in radians. */
   this.phase = 0;

  dis.BeamAntennaPattern.prototype.initFromBinary = function(inputStream)
  {
       this.beamDirection.initFromBinary(inputStream);
       this.azimuthBeamwidth = inputStream.readFloat32();
       this.elevationBeamwidth = inputStream.readFloat32();
       this.referenceSystem = inputStream.readFloat32();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
       this.ez = inputStream.readFloat32();
       this.ex = inputStream.readFloat32();
       this.phase = inputStream.readFloat32();
  };

  dis.BeamAntennaPattern.prototype.encodeToBinary = function(outputStream)
  {
       this.beamDirection.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.azimuthBeamwidth);
       outputStream.writeFloat32(this.elevationBeamwidth);
       outputStream.writeFloat32(this.referenceSystem);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
       outputStream.writeFloat32(this.ez);
       outputStream.writeFloat32(this.ex);
       outputStream.writeFloat32(this.phase);
  };
}; // end of class

 // node.js module support
exports.BeamAntennaPattern = dis.BeamAntennaPattern;

// End of BeamAntennaPattern class

