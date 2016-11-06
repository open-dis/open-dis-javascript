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


dis.ApaData = function()
{
   /** Index of APA parameter */
   this.parameterIndex = 0;

   /** Index of APA parameter */
   this.parameterValue = 0;

  dis.ApaData.prototype.initFromBinary = function(inputStream)
  {
       this.parameterIndex = inputStream.readUShort();
       this.parameterValue = inputStream.readShort();
  };

  dis.ApaData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.parameterIndex);
       outputStream.writeShort(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ApaData = dis.ApaData;

// End of ApaData class

