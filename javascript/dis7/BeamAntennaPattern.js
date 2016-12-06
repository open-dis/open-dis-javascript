/**
 * Used when the antenna pattern type field has a value of 1. Specifies the direction, pattern, and polarization of radiation from an antenna. Section 6.2.9.2
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
   /** The rotation that transforms the reference coordinate sytem into the beam coordinate system. Either world coordinates or entity coordinates may be used as the reference coordinate system, as specified by the reference system field of the antenna pattern record. */
   this.beamDirection = new dis.EulerAngles(); 

   this.azimuthBeamwidth = 0;

   this.elevationBeamwidth = 0;

   this.referenceSystem = 0;

   this.padding1 = 0;

   this.padding2 = 0;

   /** This field shall specify the magnitude of the Z-component (in beam coordinates) of the Electrical field at some arbitrary single point in the main beam and in the far field of the antenna.  */
   this.ez = 0.0;

   /** This field shall specify the magnitude of the X-component (in beam coordinates) of the Electri- cal field at some arbitrary single point in the main beam and in the far field of the antenna. */
   this.ex = 0.0;

   /** This field shall specify the phase angle between EZ and EX in radians. If fully omni-direc- tional antenna is modeled using beam pattern type one, the omni-directional antenna shall be repre- sented by beam direction Euler angles psi, theta, and phi of zero, an azimuth beamwidth of 2PI, and an elevation beamwidth of PI */
   this.phase = 0.0;

   /** padding */
   this.padding3 = 0;

  dis.BeamAntennaPattern.prototype.initFromBinary = function(inputStream)
  {
       this.beamDirection.initFromBinary(inputStream);
       this.azimuthBeamwidth = inputStream.readFloat32();
       this.elevationBeamwidth = inputStream.readFloat32();
       this.referenceSystem = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.padding2 = inputStream.readUShort();
       this.ez = inputStream.readFloat32();
       this.ex = inputStream.readFloat32();
       this.phase = inputStream.readFloat32();
       this.padding3 = inputStream.readUInt();
  };

  dis.BeamAntennaPattern.prototype.encodeToBinary = function(outputStream)
  {
       this.beamDirection.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.azimuthBeamwidth);
       outputStream.writeFloat32(this.elevationBeamwidth);
       outputStream.writeUByte(this.referenceSystem);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUShort(this.padding2);
       outputStream.writeFloat32(this.ez);
       outputStream.writeFloat32(this.ex);
       outputStream.writeFloat32(this.phase);
       outputStream.writeUInt(this.padding3);
  };
}; // end of class

 // node.js module support
exports.BeamAntennaPattern = dis.BeamAntennaPattern;

// End of BeamAntennaPattern class

