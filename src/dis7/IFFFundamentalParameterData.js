/**
 * Fundamental IFF atc data. Section 6.2.45
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


dis.IFFFundamentalParameterData = function()
{
   /** ERP */
   this.erp = 0;

   /** frequency */
   this.frequency = 0;

   /** pgrf */
   this.pgrf = 0;

   /** Pulse width */
   this.pulseWidth = 0;

   /** Burst length */
   this.burstLength = 0;

   /** Applicable modes enumeration */
   this.applicableModes = 0;

   /** System-specific data */
   this.systemSpecificData = new Array(0, 0, 0);

  dis.IFFFundamentalParameterData.prototype.initFromBinary = function(inputStream)
  {
       this.erp = inputStream.readFloat32();
       this.frequency = inputStream.readFloat32();
       this.pgrf = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
       this.burstLength = inputStream.readUInt();
       this.applicableModes = inputStream.readUByte();
       for(var idx = 0; idx < 3; idx++)
       {
          this.systemSpecificData[ idx ] = inputStream.readUByte();
       }
  };

  dis.IFFFundamentalParameterData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.erp);
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.pgrf);
       outputStream.writeFloat32(this.pulseWidth);
       outputStream.writeUInt(this.burstLength);
       outputStream.writeUByte(this.applicableModes);
       for(var idx = 0; idx < 3; idx++)
       {
          outputStream.writeUByte(this.systemSpecificData[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.IFFFundamentalParameterData = dis.IFFFundamentalParameterData;

// End of IFFFundamentalParameterData class

