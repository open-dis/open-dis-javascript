/**
 * Information about the type of modulation used for radio transmission. 6.2.59 
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
   /** This field shall indicate the spread spectrum technique or combination of spread spectrum techniques in use. Bit field. 0=freq hopping, 1=psuedo noise, time hopping=2, reamining bits unused */
   this.spreadSpectrum = 0;

   /** the major classification of the modulation type.  */
   this.majorModulation = 0;

   /** provide certain detailed information depending upon the major modulation type */
   this.detail = 0;

   /** the radio system associated with this Transmitter PDU and shall be used as the basis to interpret other fields whose values depend on a specific radio system. */
   this.radioSystem = 0;

  dis.ModulationType.prototype.initFromBinary = function(inputStream)
  {
       this.spreadSpectrum = inputStream.readUShort();
       this.majorModulation = inputStream.readUShort();
       this.detail = inputStream.readUShort();
       this.radioSystem = inputStream.readUShort();
  };

  dis.ModulationType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.spreadSpectrum);
       outputStream.writeUShort(this.majorModulation);
       outputStream.writeUShort(this.detail);
       outputStream.writeUShort(this.radioSystem);
  };
}; // end of class

 // node.js module support
exports.ModulationType = dis.ModulationType;

// End of ModulationType class

