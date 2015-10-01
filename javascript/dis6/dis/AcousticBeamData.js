/**
 * Used in UA PDU
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


dis.AcousticBeamData = function()
{
   /** beam data length */
   this.beamDataLength = 0;

   /** beamIDNumber */
   this.beamIDNumber = 0;

   /** padding */
   this.pad2 = 0;

   /** fundamental data parameters */
   this.fundamentalDataParameters = new dis.AcousticBeamFundamentalParameter(); 

  dis.AcousticBeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamDataLength = inputStream.readUShort();
       this.beamIDNumber = inputStream.readUByte();
       this.pad2 = inputStream.readUShort();
       this.fundamentalDataParameters.initFromBinary(inputStream);
  };

  dis.AcousticBeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.beamDataLength);
       outputStream.writeUByte(this.beamIDNumber);
       outputStream.writeUShort(this.pad2);
       this.fundamentalDataParameters.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.AcousticBeamData = dis.AcousticBeamData;

// End of AcousticBeamData class

