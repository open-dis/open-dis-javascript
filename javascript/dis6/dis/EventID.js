/**
 * Section 5.2.18. Identifies a unique event in a simulation via the combination of three values
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


dis.EventID = function()
{
   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the number of the event */
   this.eventNumber = 0;

  dis.EventID.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.eventNumber = inputStream.readUShort();
  };

  dis.EventID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventID = dis.EventID;

// End of EventID class

