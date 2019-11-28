/**
 * The unique designation of an attached or unattached radio in an event or exercise Section 6.2.70
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


dis.RadioIdentifier = function()
{
   /**  site */
   this.siteNumber = 0;

   /** application number */
   this.applicationNumber = 0;

   /**  reference number */
   this.referenceNumber = 0;

   /**  Radio number */
   this.radioNumber = 0;

  dis.RadioIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.radioNumber = inputStream.readUShort();
  };

  dis.RadioIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.radioNumber);
  };
}; // end of class

 // node.js module support
exports.RadioIdentifier = dis.RadioIdentifier;

// End of RadioIdentifier class

