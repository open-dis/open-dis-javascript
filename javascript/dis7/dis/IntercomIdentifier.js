/**
 * Unique designation of an attached or unattached intercom in an event or exercirse. Section 6.2.48
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


dis.IntercomIdentifier = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.referenceNumber = 0;

   this.intercomNumber = 0;

  dis.IntercomIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.intercomNumber = inputStream.readUShort();
  };

  dis.IntercomIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.intercomNumber);
  };
}; // end of class

 // node.js module support
exports.IntercomIdentifier = dis.IntercomIdentifier;

// End of IntercomIdentifier class

