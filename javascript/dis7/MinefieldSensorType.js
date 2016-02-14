/**
 * Information about a minefield sensor. Section 6.2.57
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.MinefieldSensorType = function()
{
   /** sensor type. bit fields 0-3 are the type category, 4-15 are teh subcategory */
   this.sensorType = 0;

  null.MinefieldSensorType.prototype.initFromBinary = function(inputStream)
  {
       this.sensorType = inputStream.readUShort();
  };

  null.MinefieldSensorType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sensorType);
  };
}; // end of class

 // node.js module support
exports.MinefieldSensorType = null.MinefieldSensorType;

// End of MinefieldSensorType class

