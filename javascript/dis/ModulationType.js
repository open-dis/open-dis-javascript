/**
 * Radio modulation
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


dis.ModulationType = function()
{
   /** spread spectrum, 16 bit boolean array */
   this.spreadSpectrum = 0;

   /** major */
   this.major = 0;

   /** detail */
   this.detail = 0;

   /** system */
   this.system = 0;

  dis.ModulationType.prototype.initFromBinary = function(inputStream)
  {
       this.spreadSpectrum = inputStream.readUShort();
       this.major = inputStream.readUShort();
       this.detail = inputStream.readUShort();
       this.system = inputStream.readUShort();
  };

  dis.ModulationType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.spreadSpectrum);
       outputStream.writeUShort(this.major);
       outputStream.writeUShort(this.detail);
       outputStream.writeUShort(this.system);
  };
}; // end of class

 // node.js module support
exports.ModulationType = dis.ModulationType;

// End of ModulationType class

