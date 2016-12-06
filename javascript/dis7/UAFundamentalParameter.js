/**
 * Regeneration parameters for active emission systems that are variable throughout a scenario. Section 6.2.91
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


dis.UAFundamentalParameter = function()
{
   /** Which database record shall be used. An enumeration from EBV document */
   this.activeEmissionParameterIndex = 0;

   /** The type of scan pattern, If not used, zero. An enumeration from EBV document */
   this.scanPattern = 0;

   /** center azimuth bearing of th emain beam. In radians. */
   this.beamCenterAzimuthHorizontal = 0;

   /** Horizontal beamwidth of th emain beam Meastued at the 3dB down point of peak radiated power. In radians. */
   this.azimuthalBeamwidthHorizontal = 0;

   /** center of the d/e angle of th emain beam relative to the stablised de angle of the target. In radians. */
   this.beamCenterDepressionElevation = 0;

   /** vertical beamwidth of the main beam. Meastured at the 3dB down point of peak radiated power. In radians. */
   this.beamwidthDownElevation = 0;

  dis.UAFundamentalParameter.prototype.initFromBinary = function(inputStream)
  {
       this.activeEmissionParameterIndex = inputStream.readUShort();
       this.scanPattern = inputStream.readUShort();
       this.beamCenterAzimuthHorizontal = inputStream.readFloat32();
       this.azimuthalBeamwidthHorizontal = inputStream.readFloat32();
       this.beamCenterDepressionElevation = inputStream.readFloat32();
       this.beamwidthDownElevation = inputStream.readFloat32();
  };

  dis.UAFundamentalParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.activeEmissionParameterIndex);
       outputStream.writeUShort(this.scanPattern);
       outputStream.writeFloat32(this.beamCenterAzimuthHorizontal);
       outputStream.writeFloat32(this.azimuthalBeamwidthHorizontal);
       outputStream.writeFloat32(this.beamCenterDepressionElevation);
       outputStream.writeFloat32(this.beamwidthDownElevation);
  };
}; // end of class

 // node.js module support
exports.UAFundamentalParameter = dis.UAFundamentalParameter;

// End of UAFundamentalParameter class

