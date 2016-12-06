/**
 * contains information describing the propulsion systems of the entity. This information shall be provided for each active propulsion system defined. Section 6.2.68
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


dis.PropulsionSystemData = function()
{
   /** powerSetting */
   this.powerSetting = 0;

   /** engine RPMs */
   this.engineRpm = 0;

  dis.PropulsionSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.powerSetting = inputStream.readFloat32();
       this.engineRpm = inputStream.readFloat32();
  };

  dis.PropulsionSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.powerSetting);
       outputStream.writeFloat32(this.engineRpm);
  };
}; // end of class

 // node.js module support
exports.PropulsionSystemData = dis.PropulsionSystemData;

// End of PropulsionSystemData class

