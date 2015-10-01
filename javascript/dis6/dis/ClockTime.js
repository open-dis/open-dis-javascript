/**
 * Section 5.2.8. Time measurements that exceed one hour. Hours is the number of           hours since January 1, 1970, UTC
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


dis.ClockTime = function()
{
   /** Hours in UTC */
   this.hour = 0;

   /** Time past the hour */
   this.timePastHour = 0;

  dis.ClockTime.prototype.initFromBinary = function(inputStream)
  {
       this.hour = inputStream.readInt();
       this.timePastHour = inputStream.readUInt();
  };

  dis.ClockTime.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.hour);
       outputStream.writeUInt(this.timePastHour);
  };
}; // end of class

 // node.js module support
exports.ClockTime = dis.ClockTime;

// End of ClockTime class

