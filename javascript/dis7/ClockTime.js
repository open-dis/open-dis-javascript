/**
 * Time measurements that exceed one hour are represented by this record. The first field is the hours since the unix epoch (Jan 1 1970, used by most Unix systems and java) and the second field the timestamp units since the top of the hour. Section 6.2.14
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
   /** Hours since midnight, 1970, UTC */
   this.hour = 0;

   /** Time past the hour, in timestamp form */
   this.timePastHour = new dis.Timestamp(); 

  dis.ClockTime.prototype.initFromBinary = function(inputStream)
  {
       this.hour = inputStream.readUInt();
       this.timePastHour.initFromBinary(inputStream);
  };

  dis.ClockTime.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.hour);
       this.timePastHour.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.ClockTime = dis.ClockTime;

// End of ClockTime class

