/**
 * Used in UaPdu
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


dis.AcousticBeamFundamentalParameter = function()
{
   /** parameter index */
   this.activeEmissionParameterIndex = 0;

   /** scan pattern */
   this.scanPattern = 0;

   /** beam center azimuth */
   this.beamCenterAzimuth = 0;

   /** azimuthal beamwidth */
   this.azimuthalBeamwidth = 0;

   /** beam center */
   this.beamCenterDE = 0;

   /** DE beamwidth (vertical beamwidth) */
   this.deBeamwidth = 0;

  dis.AcousticBeamFundamentalParameter.prototype.initFromBinary = function(inputStream)
  {
       this.activeEmissionParameterIndex = inputStream.readUShort();
       this.scanPattern = inputStream.readUShort();
       this.beamCenterAzimuth = inputStream.readFloat32();
       this.azimuthalBeamwidth = inputStream.readFloat32();
       this.beamCenterDE = inputStream.readFloat32();
       this.deBeamwidth = inputStream.readFloat32();
  };

  dis.AcousticBeamFundamentalParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.activeEmissionParameterIndex);
       outputStream.writeUShort(this.scanPattern);
       outputStream.writeFloat32(this.beamCenterAzimuth);
       outputStream.writeFloat32(this.azimuthalBeamwidth);
       outputStream.writeFloat32(this.beamCenterDE);
       outputStream.writeFloat32(this.deBeamwidth);
  };
}; // end of class

 // node.js module support
exports.AcousticBeamFundamentalParameter = dis.AcousticBeamFundamentalParameter;

// End of AcousticBeamFundamentalParameter class

